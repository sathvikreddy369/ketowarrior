// import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './IdealWeightCalculator.css';

// const IdealWeightCalculator = () => {
//     const [age, setAge] = useState('');
//     const [gender, setGender] = useState('');
//     const [heightUnit, setHeightUnit] = useState('cm');
//     const [heightCm, setHeightCm] = useState('');
//     const [heightFeet, setHeightFeet] = useState('');
//     const [heightInches, setHeightInches] = useState('');
//     const [idealWeightRange, setIdealWeightRange] = useState(null);
//     const [showResults, setShowResults] = useState(false);
//     const [selectedFormula, setSelectedFormula] = useState(''); // Default to empty

//     const formulaOptions = [
//         {
//             value: '',
//             label: 'Select Formula',
//             description: 'Choose a formula to calculate your ideal weight.'
//         },
//         {
//             value: 'robinson',
//             label: 'Robinson (General guideline)',
//             description: 'Often used as a general reference for ideal body weight.'
//         },
//         {
//             value: 'devine',
//             label: 'Devine (Medical, drug dosage)',
//             description: 'Historically used in medicine, particularly for estimating drug dosages.'
//         },
//         {
//             value: 'indian',
//             label: 'Indian Standard (General adaptation)',
//             description: 'A general adaptation for the Indian population; may not be universally precise.'
//         }
//     ];

//     const calculateIdealWeight = () => {
//         let heightInMeters;

//         if (heightUnit === 'cm') {
//             heightInMeters = parseFloat(heightCm) / 100;
//         } else {
//             const feet = parseFloat(heightFeet) || 0;
//             const inches = parseFloat(heightInches) || 0;
//             heightInMeters = (feet * 0.3048) + (inches * 0.0254);
//         }

//         if (heightInMeters > 0 && gender && selectedFormula) {
//             let idealWeightKgMin, idealWeightKgMax;
//             let formulaUsed = '';

//             if (selectedFormula === 'robinson') {
//                 formulaUsed = 'Robinson Formula';
//                 const heightInInches = (heightInMeters * 100) / 2.54;
//                 const heightOver5FeetInches = Math.max(0, heightInInches - 60);
//                 if (gender === 'male') {
//                     idealWeightKgMin = 52 + 1.9 * heightOver5FeetInches;
//                 } else {
//                     idealWeightKgMin = 49 + 1.7 * heightOver5FeetInches;
//                 }
//             } else if (selectedFormula === 'devine') {
//                 formulaUsed = 'Devine Formula';
//                 const heightInInches = (heightInMeters * 100) / 2.54;
//                 const heightOver5FeetInches = Math.max(0, heightInInches - 60);
//                 if (gender === 'male') {
//                     idealWeightKgMin = 50 + 2.3 * heightOver5FeetInches;
//                 } else {
//                     idealWeightKgMin = 45.5 + 2.3 * heightOver5FeetInches;
//                 }
//             } else if (selectedFormula === 'indian') {
//                 formulaUsed = 'Modified Indian Standards Guideline';
//                 const baseWeightMale = 50;
//                 const weightPerCmMale = 0.91;
//                 const baseWeightFemale = 45.5;
//                 const weightPerCmFemale = 0.89;
//                 const heightAboveBaseCm = (heightInMeters * 100) - 152.4;

//                 if (gender === 'male') {
//                     idealWeightKgMin = baseWeightMale + (heightAboveBaseCm > 0 ? heightAboveBaseCm * weightPerCmMale : 0);
//                 } else {
//                     idealWeightKgMin = baseWeightFemale + (heightAboveBaseCm > 0 ? heightAboveBaseCm * weightPerCmFemale : 0);
//                 }
//                 const ageAdjustment = parseInt(age) > 30 ? (parseInt(age) - 30) * 0.1 : 0;
//                 idealWeightKgMin += ageAdjustment;
//             }

//             idealWeightKgMax = idealWeightKgMin + (0.1 * idealWeightKgMin);
//             setIdealWeightRange({
//                 min: parseFloat(idealWeightKgMin.toFixed(1)),
//                 max: parseFloat(idealWeightKgMax.toFixed(1)),
//                 formula: formulaUsed,
//             });
//             setShowResults(true);
//         } else {
//             setIdealWeightRange(null);
//             setShowResults(false);
//             alert('Please enter valid height, select gender, and choose a formula.');
//         }
//     };

//     const weightManagementTips = [
//         "Maintain a balanced diet rich in fruits, vegetables, and whole grains.",
//         "Control portion sizes to avoid overeating.",
//         "Engage in regular physical activity for at least 30 minutes most days of the week.",
//         "Stay hydrated by drinking plenty of water.",
//         "Get adequate sleep (7-9 hours) for overall health and weight management.",
//         "Manage stress through relaxation techniques like yoga or meditation.",
//         "Limit processed foods, sugary drinks, and excessive unhealthy fats.",
//         "Consider consulting a healthcare professional or a registered dietitian for personalized advice."
//     ];

//     return (
//         <div className={`ideal-weight-calculator-container ${showResults ? 'results-visible' : ''}`}>
//             <div className="calculator-section">
//                 <h2>Ideal Weight Calculator</h2>
//                 <div className="mb-3">
//                     <label htmlFor="formula" className="form-label">Formula:</label>
//                     <select className="form-select" id="formula" value={selectedFormula} onChange={(e) => setSelectedFormula(e.target.value)}>
//                         {formulaOptions.map(option => (
//                             <option key={option.value} value={option.value} disabled={option.value === ''}>
//                                 {option.label}
//                             </option>
//                         ))}
//                     </select>
//                     <p className="form-text text-muted">
//                         {formulaOptions.find(opt => opt.value === selectedFormula)?.description}
//                     </p>
//                 </div>
//                 <div className="mb-3">
//                     <label htmlFor="age" className="form-label">Age (years):</label>
//                     <input type="number" className="form-control" id="age" value={age} onChange={(e) => setAge(e.target.value)} />
//                 </div>
//                 <div className="mb-3">
//                     <label htmlFor="gender" className="form-label">Gender:</label>
//                     <select className="form-select" id="gender" value={gender} onChange={(e) => setGender(e.target.value)}>
//                         <option value="">Select Gender</option>
//                         <option value="male">Male</option>
//                         <option value="female">Female</option>
//                     </select>
//                 </div>
//                 <div className="mb-3">
//                     <label htmlFor="height" className="form-label">Height:</label>
//                     <div className="input-group">
//                         {heightUnit === 'cm' ? (
//                             <input type="number" className="form-control" id="height" placeholder="Enter height" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
//                         ) : (
//                             <>
//                                 <input type="number" className="form-control" placeholder="Feet" value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} />
//                                 <input type="number" className="form-control" placeholder="Inches" value={heightInches} onChange={(e) => setHeightInches(e.target.value)} />
//                             </>
//                         )}
//                         <button type="button" className="btn btn-outline-secondary unit-select-button dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
//                             {heightUnit === 'cm' ? 'cm' : 'feet/inches'}
//                         </button>
//                         <ul className="dropdown-menu dropdown-menu-end unit-dropdown-menu">
//                             <li><button className="dropdown-item" type="button" onClick={() => setHeightUnit('cm')}>cm</button></li>
//                             <li><button className="dropdown-item" type="button" onClick={() => setHeightUnit('feet')}>feet & inches</button></li>
//                         </ul>
//                     </div>
//                 </div>
//                 <button className="btn btn-primary calculate-button" onClick={calculateIdealWeight} disabled={!selectedFormula}>Calculate Ideal Weight</button>
//             </div>

//             {showResults && idealWeightRange && (
//                 <div className="results-section">
//                     <h3>Ideal Weight Range</h3>
//                     <p>For your height and gender (using {idealWeightRange.formula}), the ideal weight range is approximately:
//                         <strong className="badge bg-info">{idealWeightRange.min} kg - {idealWeightRange.max} kg</strong>
//                     </p>
//                     <p className="small text-muted mt-3">
//                         * This calculation is a guideline. Ideal weight can vary based on individual factors.
//                     </p>

//                     <h4 className="mt-4">Tips for Weight Management</h4>
//                     <ul className="list-unstyled">
//                         {weightManagementTips.map((tip, index) => (
//                             <li key={index} className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>{tip}</li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//             {showResults && !idealWeightRange && (
//                 <div className="results-section error-section">
//                     <h3 className="text-danger">Error</h3>
//                     <p className="text-danger">Please enter valid height, select gender, and choose a formula.</p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default IdealWeightCalculator;



import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaWeight, FaRulerVertical, FaVenusMars, FaBirthdayCake, FaCalculator, FaInfoCircle } from 'react-icons/fa';
import './IdealWeightCalculator.css';

const IdealWeightCalculator = () => {
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [heightUnit, setHeightUnit] = useState('cm');
    const [heightCm, setHeightCm] = useState('');
    const [heightFeet, setHeightFeet] = useState('');
    const [heightInches, setHeightInches] = useState('');
    const [idealWeightRange, setIdealWeightRange] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [selectedFormula, setSelectedFormula] = useState('');
    const [touched, setTouched] = useState({
        age: false,
        gender: false,
        height: false,
        formula: false
    });

    const formulaOptions = [
        {
            value: '',
            label: 'Select Formula',
            description: 'Choose a formula to calculate your ideal weight.'
        },
        {
            value: 'robinson',
            label: 'Robinson Formula',
            description: 'General guideline often used as a reference for ideal body weight.',
            reference: 'Robinson JD, et al. (1983)'
        },
        {
            value: 'devine',
            label: 'Devine Formula',
            description: 'Historically used in medicine, particularly for estimating drug dosages.',
            reference: 'Devine BJ (1974)'
        },
        {
            value: 'indian',
            label: 'Indian Standard',
            description: 'Adaptation for the Indian population; may not be universally precise.',
            reference: 'Modified for Indian population'
        }
    ];

    const calculateIdealWeight = () => {
        let heightInMeters;

        // Validate inputs
        if (!selectedFormula) {
            setTouched(prev => ({ ...prev, formula: true }));
            return;
        }
        if (!gender) {
            setTouched(prev => ({ ...prev, gender: true }));
            return;
        }
        if (heightUnit === 'cm') {
            if (!heightCm || isNaN(heightCm) || heightCm <= 0) {
                setTouched(prev => ({ ...prev, height: true }));
                return;
            }
            heightInMeters = parseFloat(heightCm) / 100;
        } else {
            if (!heightFeet || isNaN(heightFeet) || heightFeet <= 0) {
                setTouched(prev => ({ ...prev, height: true }));
                return;
            }
            const feet = parseFloat(heightFeet) || 0;
            const inches = parseFloat(heightInches) || 0;
            heightInMeters = (feet * 0.3048) + (inches * 0.0254);
        }

        let idealWeightKgMin, idealWeightKgMax;
        let formulaUsed = formulaOptions.find(f => f.value === selectedFormula)?.label;

        if (selectedFormula === 'robinson') {
            const heightInInches = (heightInMeters * 100) / 2.54;
            const heightOver5FeetInches = Math.max(0, heightInInches - 60);
            idealWeightKgMin = gender === 'male' 
                ? 52 + 1.9 * heightOver5FeetInches 
                : 49 + 1.7 * heightOver5FeetInches;
        } 
        else if (selectedFormula === 'devine') {
            const heightInInches = (heightInMeters * 100) / 2.54;
            const heightOver5FeetInches = Math.max(0, heightInInches - 60);
            idealWeightKgMin = gender === 'male' 
                ? 50 + 2.3 * heightOver5FeetInches 
                : 45.5 + 2.3 * heightOver5FeetInches;
        } 
        else if (selectedFormula === 'indian') {
            const baseWeight = gender === 'male' ? 50 : 45.5;
            const weightPerCm = gender === 'male' ? 0.91 : 0.89;
            const heightAboveBaseCm = (heightInMeters * 100) - 152.4;
            idealWeightKgMin = baseWeight + (heightAboveBaseCm > 0 ? heightAboveBaseCm * weightPerCm : 0);
            
            // Age adjustment for Indian standard
            const ageAdjustment = age && parseInt(age) > 30 ? (parseInt(age) - 30) * 0.1 : 0;
            idealWeightKgMin += ageAdjustment;
        }

        idealWeightKgMax = idealWeightKgMin + (0.1 * idealWeightKgMin);
        setIdealWeightRange({
            min: parseFloat(idealWeightKgMin.toFixed(1)),
            max: parseFloat(idealWeightKgMax.toFixed(1)),
            formula: formulaUsed,
            reference: formulaOptions.find(f => f.value === selectedFormula)?.reference
        });
        setShowResults(true);
    };

    const resetForm = () => {
        setAge('');
        setGender('');
        setHeightCm('');
        setHeightFeet('');
        setHeightInches('');
        setSelectedFormula('');
        setIdealWeightRange(null);
        setShowResults(false);
        setTouched({
            age: false,
            gender: false,
            height: false,
            formula: false
        });
    };

    const weightManagementTips = [
        "Maintain a balanced diet rich in fruits, vegetables, and whole grains.",
        "Control portion sizes to avoid overeating.",
        "Engage in regular physical activity for at least 30 minutes most days.",
        "Stay hydrated by drinking plenty of water throughout the day.",
        "Get 7-9 hours of quality sleep for optimal metabolism.",
        "Manage stress through relaxation techniques like meditation or yoga.",
        "Limit processed foods, sugary drinks, and excessive unhealthy fats.",
        "Consult a healthcare professional for personalized advice."
    ];

    return (
        <div className="ideal-weight-calculator-container">
            <div className="calculator-card">
                <div className="calculator-header">
                    <h2>
                        <FaCalculator className="me-2" />
                        Ideal Weight Calculator
                    </h2>
                    <p className="text-muted">
                        Calculate your healthy weight range based on different medical formulas
                    </p>
                </div>

                <div className="calculator-body">
                    <div className="mb-4">
                        <label htmlFor="formula" className="form-label">
                            <FaInfoCircle className="me-2" />
                            Calculation Formula
                        </label>
                        <select
                            className={`form-select ${touched.formula && !selectedFormula ? 'is-invalid' : ''}`}
                            id="formula"
                            value={selectedFormula}
                            onChange={(e) => {
                                setSelectedFormula(e.target.value);
                                setTouched(prev => ({ ...prev, formula: true }));
                            }}
                            onBlur={() => setTouched(prev => ({ ...prev, formula: true }))}
                        >
                            {formulaOptions.map(option => (
                                <option key={option.value} value={option.value} disabled={option.value === ''}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        {touched.formula && !selectedFormula && (
                            <div className="invalid-feedback">Please select a calculation formula</div>
                        )}
                        {selectedFormula && (
                            <div className="formula-info mt-2">
                                <small className="text-muted">
                                    {formulaOptions.find(f => f.value === selectedFormula)?.description}
                                </small>
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label htmlFor="age" className="form-label">
                            <FaBirthdayCake className="me-2" />
                            Age (years)
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            id="age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            min="18"
                            max="120"
                            placeholder="Optional for most formulas"
                        />
                        <small className="text-muted">Only affects Indian Standard calculation</small>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="gender" className="form-label">
                            <FaVenusMars className="me-2" />
                            Gender
                        </label>
                        <select
                            className={`form-select ${touched.gender && !gender ? 'is-invalid' : ''}`}
                            id="gender"
                            value={gender}
                            onChange={(e) => {
                                setGender(e.target.value);
                                setTouched(prev => ({ ...prev, gender: true }));
                            }}
                            onBlur={() => setTouched(prev => ({ ...prev, gender: true }))}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        {touched.gender && !gender && (
                            <div className="invalid-feedback">Please select your gender</div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="form-label">
                            <FaRulerVertical className="me-2" />
                            Height
                        </label>
                        <div className="input-group">
                            {heightUnit === 'cm' ? (
                                <input
                                    type="number"
                                    className={`form-control ${touched.height && !heightCm ? 'is-invalid' : ''}`}
                                    placeholder="Enter height in cm"
                                    value={heightCm}
                                    onChange={(e) => setHeightCm(e.target.value)}
                                    onBlur={() => setTouched(prev => ({ ...prev, height: true }))}
                                    min="100"
                                    max="300"
                                />
                            ) : (
                                <div className="d-flex w-100">
                                    <input
                                        type="number"
                                        className={`form-control me-2 ${touched.height && !heightFeet ? 'is-invalid' : ''}`}
                                        placeholder="Feet"
                                        value={heightFeet}
                                        onChange={(e) => setHeightFeet(e.target.value)}
                                        onBlur={() => setTouched(prev => ({ ...prev, height: true }))}
                                        min="3"
                                        max="8"
                                    />
                                    <input
                                        type="number"
                                        className={`form-control ${touched.height && !heightInches ? 'is-invalid' : ''}`}
                                        placeholder="Inches"
                                        value={heightInches}
                                        onChange={(e) => setHeightInches(e.target.value)}
                                        onBlur={() => setTouched(prev => ({ ...prev, height: true }))}
                                        min="0"
                                        max="11"
                                    />
                                </div>
                            )}
                            <button
                                className="btn btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                {heightUnit === 'cm' ? 'cm' : 'ft/in'}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <button
                                        className="dropdown-item"
                                        type="button"
                                        onClick={() => {
                                            setHeightUnit('cm');
                                            setHeightFeet('');
                                            setHeightInches('');
                                        }}
                                    >
                                        Centimeters (cm)
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item"
                                        type="button"
                                        onClick={() => {
                                            setHeightUnit('feet');
                                            setHeightCm('');
                                        }}
                                    >
                                        Feet & Inches (ft/in)
                                    </button>
                                </li>
                            </ul>
                        </div>
                        {touched.height && ((heightUnit === 'cm' && !heightCm) || 
                         (heightUnit === 'feet' && !heightFeet)) && (
                            <div className="invalid-feedback d-block">Please enter your height</div>
                        )}
                    </div>

                    <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                        <button
                            className="btn btn-outline-secondary me-md-2"
                            onClick={resetForm}
                        >
                            Reset
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={calculateIdealWeight}
                            disabled={!selectedFormula || !gender || 
                                     (heightUnit === 'cm' ? !heightCm : !heightFeet)}
                        >
                            Calculate Ideal Weight
                        </button>
                    </div>
                </div>
            </div>

            {showResults && idealWeightRange && (
                <div className="results-card">
                    <div className="results-header">
                        <h3>Your Ideal Weight Results</h3>
                    </div>
                    <div className="results-body">
                        <div className="result-summary">
                            <div className="formula-used">
                                <small className="text-muted">Using {idealWeightRange.formula}</small>
                                {idealWeightRange.reference && (
                                    <small className="text-muted d-block">Reference: {idealWeightRange.reference}</small>
                                )}
                            </div>
                            
                            <div className="weight-range">
                                <div className="range-value min">
                                    <span className="value">{idealWeightRange.min}</span>
                                    <span className="unit">kg</span>
                                </div>
                                <div className="range-separator">to</div>
                                <div className="range-value max">
                                    <span className="value">{idealWeightRange.max}</span>
                                    <span className="unit">kg</span>
                                </div>
                            </div>

                            <div className="note">
                                <small className="text-muted">
                                    * This is an estimate. Individual factors like muscle mass and body composition can affect ideal weight.
                                </small>
                            </div>
                        </div>

                        <div className="weight-tips">
                            <h5>
                                <FaInfoCircle className="me-2" />
                                Healthy Weight Management Tips
                            </h5>
                            <ul className="tips-list">
                                {weightManagementTips.map((tip, index) => (
                                    <li key={index} className="tip-item">
                                        <span className="tip-bullet">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IdealWeightCalculator;