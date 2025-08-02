import axios from 'axios';
import { TurbineParameters } from '@/components/ParameterControls';

const API_BASE_URL = 'http://localhost:5000'; // Backend URL

export interface PredictionResponse {
  prediction: 'normal' | 'warning' | 'fault';
  probability: number;
  confidence: number;
  affectedComponents: string[];
  shapValues: { [key: string]: number };
  timestamp: string;
}

export interface ExplanationResponse {
  shapPlot: string; // Base64 encoded plot
  featureImportance: { [key: string]: number };
}

// Mock API for development when backend isn't available
const mockPrediction = (parameters: TurbineParameters): PredictionResponse => {
  // Simple rule-based mock prediction
  let faultScore = 0;
  const affectedComponents: string[] = [];
  
  // Check various parameters for fault conditions
  if (parameters.vibrationLevels > 70) {
    faultScore += 0.3;
    affectedComponents.push('Gearbox', 'Bearings');
  }
  
  if (parameters.componentTemperatures > 90) {
    faultScore += 0.25;
    affectedComponents.push('Generator', 'Power Electronics');
  }
  
  if (parameters.windSpeed > 25 || parameters.windSpeed < 3) {
    faultScore += 0.2;
    affectedComponents.push('Rotor', 'Control System');
  }
  
  if (parameters.powerFactor < 0.85) {
    faultScore += 0.15;
    affectedComponents.push('Power Electronics');
  }
  
  if (parameters.gearboxOilCondition < 30) {
    faultScore += 0.1;
    affectedComponents.push('Gearbox');
  }

  // Determine prediction based on fault score
  let prediction: 'normal' | 'warning' | 'fault';
  if (faultScore > 0.6) {
    prediction = 'fault';
  } else if (faultScore > 0.3) {
    prediction = 'warning';
  } else {
    prediction = 'normal';
  }

  // Generate mock SHAP values
  const shapValues = {
    vibrationLevels: parameters.vibrationLevels > 70 ? 0.15 : -0.05,
    componentTemperatures: parameters.componentTemperatures > 90 ? 0.12 : -0.03,
    windSpeed: parameters.windSpeed > 25 || parameters.windSpeed < 3 ? 0.1 : -0.02,
    powerFactor: parameters.powerFactor < 0.85 ? 0.08 : -0.01,
    gearboxOilCondition: parameters.gearboxOilCondition < 30 ? 0.06 : -0.01,
    generatorPower: Math.random() * 0.04 - 0.02,
    frequency: Math.random() * 0.02 - 0.01,
  };

  return {
    prediction,
    probability: Math.min(faultScore + Math.random() * 0.1, 1),
    confidence: 0.85 + Math.random() * 0.1,
    affectedComponents: [...new Set(affectedComponents)],
    shapValues,
    timestamp: new Date().toISOString(),
  };
};

export const turbineApi = {
  // Predict fault based on parameters
  predict: async (parameters: TurbineParameters): Promise<PredictionResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/predict`, parameters, {
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      console.warn('Backend not available, using mock data:', error);
      // Return mock data if backend is not available
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockPrediction(parameters));
        }, 1500); // Simulate API delay
      });
    }
  },

  // Get SHAP explanation
  getExplanation: async (parameters: TurbineParameters): Promise<ExplanationResponse> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/explain`, parameters, {
        timeout: 15000,
      });
      return response.data;
    } catch (error) {
      console.warn('Backend not available for explanation');
      throw new Error('Explanation service unavailable');
    }
  },

  // Get fault location for 3D visualization
  getFaultLocation: async (parameters: TurbineParameters) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/fault-location`, parameters);
      return response.data;
    } catch (error) {
      console.warn('Backend not available for fault location');
      return { locations: [] };
    }
  },

  // Health check
  healthCheck: async (): Promise<boolean> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  },
};