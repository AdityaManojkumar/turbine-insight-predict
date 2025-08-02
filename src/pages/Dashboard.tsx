import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Wind, Zap, Settings, BarChart3 } from 'lucide-react';
import WindTurbine3D from '@/components/WindTurbine3D';
import ParameterControls, { TurbineParameters } from '@/components/ParameterControls';
import PredictionPanel from '@/components/PredictionPanel';
import { turbineApi, PredictionResponse } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const defaultParameters: TurbineParameters = {
  // Electrical Parameters
  generatorPower: 2500,
  voltage: 690,
  current: 2100,
  frequency: 50,
  powerFactor: 0.95,

  // Wind & Environmental Parameters
  windSpeed: 12.5,
  windDirection: 180,
  turbulenceIntensity: 15,
  airDensity: 1.225,
  temperature: 20,
  pressure: 1013,
  humidity: 65,

  // Performance Parameters
  tipSpeedRatio: 7.5,
  coefficientPerformance: 0.45,
  powerCurve: 85,
  capacityFactor: 35,

  // Control Parameters
  cutInWindSpeed: 3.5,
  ratedWindSpeed: 12.0,
  cutOutWindSpeed: 25.0,
  brakingSystemType: 'aerodynamic',

  // Health Monitoring Parameters
  vibrationLevels: 25,
  componentTemperatures: 65,
  gearboxOilCondition: 85,
  noiseLevels: 45,

  // Structural Parameters
  towerType: 'tubular',
  materialProperties: 95,
  foundationType: 'gravity',
};

export default function Dashboard() {
  const [parameters, setParameters] = useState<TurbineParameters>(defaultParameters);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleParameterChange = useCallback((key: keyof TurbineParameters, value: number | string) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const result = await turbineApi.predict(parameters);
      setPrediction(result);
      
      toast({
        title: "Analysis Complete",
        description: `Fault prediction: ${result.prediction} (${(result.probability * 100).toFixed(1)}% probability)`,
        variant: result.prediction === 'fault' ? 'destructive' : 'default',
      });
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: "Unable to analyze turbine parameters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRotationSpeed = () => {
    // Calculate rotation speed based on wind speed and tip speed ratio
    const rotorDiameter = 126; // meters (typical for 2.5MW turbine)
    const rotorRadius = rotorDiameter / 2;
    const tipSpeed = parameters.tipSpeedRatio * parameters.windSpeed;
    return tipSpeed / rotorRadius; // rad/s
  };

  const getFaultStatus = () => {
    if (!prediction) return 'normal';
    return prediction.prediction;
  };

  return (
    <div className="min-h-screen bg-gradient-sky">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wind className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  WindSight AI
                </h1>
                <p className="text-sm text-muted-foreground">
                  Intelligent Wind Turbine Fault Prediction
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                System Online
              </Badge>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main 3D Visualization */}
          <div className="xl:col-span-2">
            <Card className="h-[600px] bg-card/50 backdrop-blur-sm shadow-turbine">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  3D Turbine Visualization
                </CardTitle>
                <CardDescription>
                  Interactive 3D model showing real-time turbine status and fault locations
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[520px] p-6">
                <WindTurbine3D 
                  faultStatus={getFaultStatus()}
                  rotationSpeed={getRotationSpeed()}
                  className="rounded-lg overflow-hidden"
                />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <Card className="bg-gradient-primary text-primary-foreground">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8" />
                    <div>
                      <p className="text-2xl font-bold">{parameters.generatorPower}</p>
                      <p className="text-sm opacity-90">kW Power</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-secondary text-secondary-foreground">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Wind className="w-8 h-8" />
                    <div>
                      <p className="text-2xl font-bold">{parameters.windSpeed}</p>
                      <p className="text-sm opacity-90">m/s Wind</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-energy text-accent-foreground">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-8 h-8" />
                    <div>
                      <p className="text-2xl font-bold">{parameters.capacityFactor}</p>
                      <p className="text-sm opacity-90">% Capacity</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {prediction ? (prediction.probability * 100).toFixed(0) : '--'}
                      </p>
                      <p className="text-sm text-muted-foreground">% Risk</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Control Panel */}
          <div className="xl:col-span-1">
            <Tabs defaultValue="prediction" className="h-fit">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prediction">Analysis</TabsTrigger>
                <TabsTrigger value="parameters">Parameters</TabsTrigger>
              </TabsList>
              
              <TabsContent value="prediction" className="mt-6">
                <PredictionPanel
                  parameters={parameters}
                  prediction={prediction}
                  isLoading={isLoading}
                  onPredict={handlePredict}
                />
              </TabsContent>
              
              <TabsContent value="parameters" className="mt-6">
                <ScrollArea className="h-[700px] pr-4">
                  <ParameterControls
                    parameters={parameters}
                    onParameterChange={handleParameterChange}
                  />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}