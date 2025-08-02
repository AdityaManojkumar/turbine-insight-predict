# WindSight AI - Wind Turbine Fault Prediction System

A comprehensive full-stack application for intelligent wind turbine fault prediction using AI/ML, featuring real-time 3D visualization and explainable predictions.

![WindSight AI Dashboard](https://via.placeholder.com/800x400/0ea5e9/ffffff?text=WindSight+AI+Dashboard)

## 🌟 Features

### 🎯 Core Functionality
- **AI-Powered Fault Prediction**: Advanced ML models with SHAP explanations for interpretable results
- **3D Interactive Visualization**: Real-time wind turbine model with fault highlighting
- **Comprehensive Parameter Control**: 30+ parameters across 6 categories
- **Real-time Monitoring**: Live parameter updates with instant visual feedback

### 🎨 Frontend Features
- **Modern UI/UX**: Built with React, TailwindCSS, and shadcn/ui components
- **3D Graphics**: Interactive Three.js turbine model with realistic animations
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme switching support

### 🧠 AI/ML Features
- **Fault Classification**: Predicts Normal, Warning, or Fault conditions
- **Probability Scoring**: Confidence levels for each prediction
- **SHAP Explanations**: Feature importance visualization
- **Component Analysis**: Identifies affected turbine components

### 📊 Parameter Categories

#### ⚡ Electrical Parameters
- Generator Output Power (kW/MW)
- Voltage and Current
- Frequency and Power Factor

#### 🌪️ Wind & Environmental
- Wind Speed, Direction, Turbulence
- Air Density, Temperature, Pressure
- Humidity conditions

#### 📈 Performance Metrics
- Tip Speed Ratio (TSR)
- Coefficient of Performance (Cp)
- Power Curve and Capacity Factor

#### 🎛️ Control Parameters
- Cut-in/Rated/Cut-out Wind Speeds
- Braking System Configuration

#### 🔧 Health Monitoring
- Vibration Levels
- Component Temperatures
- Gearbox Oil Condition
- Noise Levels

#### 🏗️ Structural Parameters
- Tower Type and Materials
- Foundation Configuration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for backend)
- Git

### Frontend Setup

```bash
# Clone the repository
git clone <your-repository-url>
cd wind-turbine-fault-predictor

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

### Backend Setup (Optional)

The frontend includes a comprehensive mock API that simulates the full ML pipeline. For production deployment, set up the Python backend:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start the backend server
python app.py
```

Backend will run on `http://localhost:5000`

## 🏗️ Project Structure

```
wind-turbine-fault-predictor/
├── src/
│   ├── components/
│   │   ├── WindTurbine3D.tsx      # 3D visualization component
│   │   ├── ParameterControls.tsx  # Parameter input controls
│   │   └── PredictionPanel.tsx    # AI prediction interface
│   ├── pages/
│   │   └── Dashboard.tsx          # Main dashboard
│   ├── services/
│   │   └── api.ts                 # API integration with mock fallback
│   └── styles/                    # Theme and styling
├── backend/                       # Python ML backend (optional)
├── model/                         # Trained ML models
└── assets/                        # 3D models and visuals
```

## 🎮 Usage Guide

### 1. Parameter Control
- Use the **Parameters** tab to adjust turbine operating conditions
- Parameters are organized by category for easy navigation
- Real-time updates reflect in the 3D visualization

### 2. Fault Analysis
- Click **"Run Fault Analysis"** in the Analysis tab
- AI model analyzes current parameters
- Results show prediction, probability, and affected components

### 3. 3D Visualization
- Interactive 3D turbine model responds to parameters
- Color-coded fault status (Green=Normal, Yellow=Warning, Red=Fault)
- Rotation speed varies with wind conditions

### 4. SHAP Explanations
- Feature importance shows which parameters contribute most to predictions
- Positive values increase fault probability
- Negative values decrease fault probability

## 🔧 Technology Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **Three.js** with React-Three-Fiber for 3D graphics
- **shadcn/ui** component library
- **Axios** for API communication

### Backend (Optional)
- **Python Flask/FastAPI**
- **Scikit-learn** or **XGBoost** for ML
- **SHAP** for explainable AI
- **NumPy/Pandas** for data processing

### Development Tools
- **Vite** for fast development
- **ESLint** for code quality
- **TypeScript** for type safety

## 🎨 Design System

The application uses a comprehensive design system with:
- **Wind Energy Theme**: Blues, greens, and whites inspired by renewable energy
- **Semantic Tokens**: Consistent color usage across components
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: WCAG compliant color contrasts and interactions

## 📈 Mock Data & Simulation

The application includes intelligent mock data that:
- Simulates realistic turbine behavior
- Provides believable fault scenarios
- Demonstrates SHAP explanations
- Shows component-specific fault analysis

### Fault Simulation Logic
- High vibration levels (>70) → Gearbox/Bearing faults
- Excessive temperatures (>90°C) → Generator/Electronics issues
- Extreme wind conditions → Rotor/Control system problems
- Poor power factor (<0.85) → Power electronics faults

## 🔮 Future Enhancements

- [ ] Historical data visualization and trends
- [ ] CSV batch processing for multiple turbines
- [ ] Real-time data streaming integration
- [ ] Advanced SHAP visualizations (force plots, waterfall charts)
- [ ] Predictive maintenance scheduling
- [ ] Fleet management dashboard
- [ ] Alert notification system
- [ ] Integration with SCADA systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Wind energy industry expertise and best practices
- Open source community for excellent libraries
- Three.js community for 3D graphics inspiration
- SHAP project for explainable AI capabilities

---

**Built with ❤️ for the renewable energy future**