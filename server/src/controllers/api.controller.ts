import { Request,Response } from "express"
import { parseTradingPrompt } from '../services/ai.service.js'
import { runBacktest } from '../services/backtest.service.js'
export const getData = async(req:Request,res:Response) => {
try {
    const { userPrompt } = req.body;

    if (!userPrompt || typeof userPrompt !== 'string') {
      res.status(400).json({ error: 'Valid userPrompt string is required.' });
      return;
    }

    console.log(`[System] Parsing hypothesis: "${userPrompt}"`);
    const aiParams = await parseTradingPrompt(userPrompt);

    console.log(`[System] Running $O(N) execution loop for ${aiParams.instrument}...`);
    const backtestMetrics = await runBacktest(aiParams);

    res.json({ 
      success: true, 
      experiment: aiParams,
      results: backtestMetrics 
    });

  } catch (error: any) {
    console.error('[Controller Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }

}