import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

export async function proxyMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  try {
    // Extract API key from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    
    const apiKey = authHeader.substring(7);
    
    // Validate API key and get user
    const user = await storage.getApiUserByKey(apiKey);
    if (!user) {
      await storage.createRequestLog({
        userApiKey: apiKey,
        modelAlias: req.body?.model || 'unknown',
        upstreamApiId: null,
        requestUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        requestBody: req.body,
        statusCode: 401,
        responseTimeMs: Date.now() - startTime,
        requestTokens: null,
        responseTokens: null,
        errorMessage: 'Invalid API key',
      });
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Extract model from request body
    const requestedModel = req.body?.model;
    if (!requestedModel) {
      return res.status(400).json({ error: 'Model parameter is required' });
    }
    
    // Check if user has permission to use this model
    if (!user.allowedModels.includes(requestedModel)) {
      await storage.createRequestLog({
        userApiKey: apiKey,
        modelAlias: requestedModel,
        upstreamApiId: null,
        requestUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        requestBody: req.body,
        statusCode: 403,
        responseTimeMs: Date.now() - startTime,
        requestTokens: null,
        responseTokens: null,
        errorMessage: 'Model not allowed for this user',
      });
      return res.status(403).json({ error: 'You do not have permission to use this model' });
    }
    
    // Get model alias configuration
    const modelAlias = await storage.getModelAlias(requestedModel);
    if (!modelAlias) {
      await storage.createRequestLog({
        userApiKey: apiKey,
        modelAlias: requestedModel,
        upstreamApiId: null,
        requestUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        requestBody: req.body,
        statusCode: 404,
        responseTimeMs: Date.now() - startTime,
        requestTokens: null,
        responseTokens: null,
        errorMessage: 'Model alias not found',
      });
      return res.status(404).json({ error: 'Model not found' });
    }
    
    // Get upstream API configuration
    const upstreamApi = await storage.getApi(modelAlias.apiId);
    if (!upstreamApi || !upstreamApi.isActive) {
      await storage.createRequestLog({
        userApiKey: apiKey,
        modelAlias: requestedModel,
        upstreamApiId: modelAlias.apiId,
        requestUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        requestBody: req.body,
        statusCode: 503,
        responseTimeMs: Date.now() - startTime,
        requestTokens: null,
        responseTokens: null,
        errorMessage: 'Upstream API not available',
      });
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }
    
    // Prepare request to upstream API
    const upstreamUrl = upstreamApi.baseUrl + req.path.replace('/v1/', '');
    const upstreamBody = {
      ...req.body,
      model: upstreamApi.modelName, // Replace alias with actual model name
    };
    
    try {
      // Make request to upstream API
      const upstreamResponse = await fetch(upstreamUrl, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${upstreamApi.apiKey}`,
        },
        body: JSON.stringify(upstreamBody),
      });
      const responseData = await upstreamResponse.json();
      const responseTime = Date.now() - startTime;
      
      // Log the request
      await storage.createRequestLog({
        userApiKey: apiKey,
        modelAlias: requestedModel,
        upstreamApiId: upstreamApi.id,
        requestUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        requestBody: req.body,
        statusCode: upstreamResponse.status,
        responseTimeMs: responseTime,
        requestTokens: responseData.usage?.prompt_tokens || null,
        responseTokens: responseData.usage?.completion_tokens || null,
        errorMessage: upstreamResponse.ok ? null : responseData.error?.message || 'Unknown error',
      });
      
      // Return response with original model alias
      if (responseData.model) {
        responseData.model = requestedModel;
      }
      
      res.status(upstreamResponse.status).json(responseData);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await storage.createRequestLog({
        userApiKey: apiKey,
        modelAlias: requestedModel,
        upstreamApiId: upstreamApi.id,
        requestUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        requestBody: req.body,
        statusCode: 500,
        responseTimeMs: responseTime,
        requestTokens: null,
        responseTokens: null,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      
      res.status(500).json({ error: 'Internal server error' });
    }
  } catch (error) {
    next(error);
  }
}
