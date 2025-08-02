import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ExplainableAIProps {
  prediction: {
    prediction: 'normal' | 'warning' | 'fault';
    probability: number;
    confidence: number;
    affectedComponents: string[];
    shapValues?: { [key: string]: number };
  } | null;
  parameters: any;
}

export default function ExplainableAI({ prediction, parameters }: ExplainableAIProps) {
  if (!prediction?.shapValues) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            AI Explanation
          </CardTitle>
          <CardDescription>
            Run a prediction to see detailed explanations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No explanation data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getParameterName = (key: string): string => {
    const parameterNames: { [key: string]: string } = {
      vibrationLevels: 'Vibration Levels',
      componentTemperatures: 'Component Temperature',
      windSpeed: 'Wind Speed',
      powerFactor: 'Power Factor',
      gearboxOilCondition: 'Gearbox Oil Quality',
      generatorPower: 'Generator Power',
      frequency: 'Electrical Frequency',
      current: 'Electrical Current',
      voltage: 'Voltage',
      turbulenceIntensity: 'Turbulence Intensity',
      tipSpeedRatio: 'Tip Speed Ratio',
      coefficientPerformance: 'Performance Coefficient'
    };
    return parameterNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  const getParameterDescription = (key: string): string => {
    const descriptions: { [key: string]: string } = {
      vibrationLevels: 'High vibration can indicate bearing wear, imbalance, or gearbox issues',
      componentTemperatures: 'Elevated temperatures suggest overheating in electrical or mechanical components',
      windSpeed: 'Both very low and very high wind speeds can cause operational issues',
      powerFactor: 'Low power factor indicates electrical system inefficiency or faults',
      gearboxOilCondition: 'Poor oil condition leads to increased wear and potential failures',
      generatorPower: 'Power output deviations can indicate generator or grid connection issues',
      frequency: 'Frequency variations suggest grid instability or control system problems',
      current: 'Current anomalies may indicate electrical faults or load imbalances',
      voltage: 'Voltage fluctuations can cause equipment stress and reduced efficiency',
      turbulenceIntensity: 'High turbulence increases fatigue loads on turbine components',
      tipSpeedRatio: 'Optimal tip speed ratio is crucial for maximum energy capture',
      coefficientPerformance: 'Performance coefficient indicates overall turbine efficiency'
    };
    return descriptions[key] || 'This parameter affects turbine operation and health';
  };

  const getParameterValue = (key: string): string => {
    const value = parameters[key];
    const units: { [key: string]: string } = {
      vibrationLevels: 'mm/s',
      componentTemperatures: '°C',
      windSpeed: 'm/s',
      powerFactor: '',
      gearboxOilCondition: '%',
      generatorPower: 'kW',
      frequency: 'Hz',
      current: 'A',
      voltage: 'V',
      turbulenceIntensity: '%',
      tipSpeedRatio: '',
      coefficientPerformance: ''
    };
    
    const unit = units[key] || '';
    const formattedValue = typeof value === 'number' ? value.toFixed(1) : value;
    return `${formattedValue} ${unit}`.trim();
  };

  const getImpactLevel = (shapValue: number): string => {
    const abs = Math.abs(shapValue);
    if (abs > 0.1) return 'High';
    if (abs > 0.05) return 'Medium';
    return 'Low';
  };

  const getImpactColor = (shapValue: number): string => {
    if (shapValue > 0.05) return 'text-destructive';
    if (shapValue > 0.02) return 'text-yellow-600';
    if (shapValue < -0.02) return 'text-secondary';
    return 'text-muted-foreground';
  };

  const getRecommendation = (key: string, shapValue: number, currentValue: any): string => {
    const recommendations: { [key: string]: (value: any, impact: number) => string } = {
      vibrationLevels: (val, impact) => {
        if (impact > 0.05 && val > 50) return 'Check bearings and perform balancing maintenance';
        if (val > 70) return 'Schedule immediate vibration analysis and bearing inspection';
        return 'Monitor vibration trends and maintain regular inspection schedule';
      },
      componentTemperatures: (val, impact) => {
        if (impact > 0.05 && val > 80) return 'Check cooling systems and electrical connections';
        if (val > 100) return 'Immediate shutdown recommended to prevent damage';
        return 'Monitor temperature trends and ensure proper ventilation';
      },
      windSpeed: (val, impact) => {
        if (val < 3) return 'Normal operation - below cut-in wind speed';
        if (val > 25) return 'Monitor for potential cut-out conditions';
        return 'Optimal wind conditions for power generation';
      },
      powerFactor: (val, impact) => {
        if (impact > 0.03 && val < 0.9) return 'Check electrical connections and power electronics';
        return 'Power factor within acceptable range';
      },
      gearboxOilCondition: (val, impact) => {
        if (impact > 0.03 && val < 50) return 'Schedule oil change and filter replacement';
        if (val < 30) return 'Immediate oil system maintenance required';
        return 'Oil condition satisfactory';
      }
    };

    const getRecommendation = recommendations[key];
    if (getRecommendation) {
      return getRecommendation(currentValue, shapValue);
    }
    return 'Monitor parameter within normal operational ranges';
  };

  // Sort SHAP values by absolute impact
  const sortedShapValues = Object.entries(prediction.shapValues)
    .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
    .slice(0, 8); // Show top 8 most important features

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Overall Explanation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              AI Explanation - Why This Prediction?
            </CardTitle>
            <CardDescription>
              Understanding the factors that led to this {prediction.prediction} prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold">
                    {(prediction.probability * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Fault Probability</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {(prediction.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Model Confidence</div>
                </div>
              </div>
              
              <div className="text-sm">
                <strong>Summary:</strong> The AI model analyzed {Object.keys(prediction.shapValues).length} parameters 
                and identified <strong>{prediction.affectedComponents.length} potentially affected components</strong>. 
                The {prediction.prediction} prediction is primarily driven by the parameters highlighted below.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Importance Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Importance Analysis</CardTitle>
            <CardDescription>
              How each parameter contributed to the prediction (SHAP values)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedShapValues.map(([key, value]) => (
                <div key={key} className="space-y-2 p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {value > 0 ? (
                          <TrendingUp className="w-4 h-4 text-destructive" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-secondary" />
                        )}
                        <span className="font-medium">{getParameterName(key)}</span>
                      </div>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{getParameterDescription(key)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant={value > 0.05 ? 'destructive' : value > 0.02 ? 'secondary' : 'outline'}>
                        {getImpactLevel(value)} Impact
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getParameterValue(key)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Contribution to fault prediction</span>
                        <span className={getImpactColor(value)}>
                          {value > 0 ? '+' : ''}{value.toFixed(3)}
                        </span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`absolute top-0 h-full transition-all duration-300 ${
                            value > 0 ? 'bg-destructive' : 'bg-secondary'
                          }`}
                          style={{ 
                            width: `${Math.min(Math.abs(value) * 100, 100)}%`,
                            left: value < 0 ? `${100 - Math.min(Math.abs(value) * 100, 100)}%` : '0'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    <strong>Recommendation:</strong> {getRecommendation(key, value, parameters[key])}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prediction Interpretation */}
        <Card>
          <CardHeader>
            <CardTitle>Prediction Interpretation</CardTitle>
            <CardDescription>
              What this means for turbine operation and maintenance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prediction.prediction === 'fault' && (
                <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded">
                  <div className="font-medium text-destructive mb-2">Fault Condition Detected</div>
                  <div className="text-sm">
                    The AI model has identified patterns consistent with fault conditions. 
                    Immediate attention is recommended to prevent potential equipment damage or safety hazards.
                  </div>
                </div>
              )}

              {prediction.prediction === 'warning' && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                  <div className="font-medium text-yellow-800 mb-2">Warning Condition</div>
                  <div className="text-sm text-yellow-700">
                    The system shows early indicators of potential issues. 
                    Increased monitoring and preventive maintenance are recommended.
                  </div>
                </div>
              )}

              {prediction.prediction === 'normal' && (
                <div className="p-4 bg-secondary/10 border-l-4 border-secondary rounded">
                  <div className="font-medium text-secondary mb-2">Normal Operation</div>
                  <div className="text-sm">
                    All monitored parameters are within expected ranges. 
                    Continue with regular maintenance schedule and monitoring protocols.
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground mt-4">
                <strong>Note:</strong> This explanation is generated using SHAP (SHapley Additive exPlanations) 
                values, which show how each feature contributes to the model's prediction compared to the average prediction.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}