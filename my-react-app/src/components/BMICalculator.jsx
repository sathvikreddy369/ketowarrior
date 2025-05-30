// import React, { useState } from 'react';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './BMICalculator.css';

// const BMICalculator = () => {
//     const [age, setAge] = useState('');
//     const [gender, setGender] = useState('');
//     const [heightUnit, setHeightUnit] = useState('cm');
//     const [heightCm, setHeightCm] = useState('');
//     const [heightFeet, setHeightFeet] = useState('');
//     const [heightInches, setHeightInches] = useState('');
//     const [weightUnit, setWeightUnit] = useState('kg');
//     const [weightKg, setWeightKg] = useState('');
//     const [weightLbs, setWeightLbs] = useState('');
//     const [bmi, setBmi] = useState(null);
//     const [showResults, setShowResults] = useState(false);

//     const calculateBMI = () => {
//         let heightInMeters;
//         let weightInKg;

//         if (heightUnit === 'cm') {
//             heightInMeters = parseFloat(heightCm) / 100;
//         } else {
//             const feet = parseFloat(heightFeet) || 0;
//             const inches = parseFloat(heightInches) || 0;
//             heightInMeters = (feet * 0.3048) + (inches * 0.0254);
//         }

//         if (weightUnit === 'kg') {
//             weightInKg = parseFloat(weightKg);
//         } else {
//             weightInKg = parseFloat(weightLbs) * 0.453592;
//         }

//         if (heightInMeters > 0 && weightInKg > 0) {
//             const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
//             setBmi(parseFloat(calculatedBmi.toFixed(2)));
//             setShowResults(true);
//         } else {
//             setBmi(null);
//             setShowResults(false);
//             alert('Please enter valid height and weight.');
//         }
//     };

//     const getBmiCategory = (bmiValue) => {
//         if (bmiValue < 18.5) {
//             return 'Underweight';
//         } else if (bmiValue >= 18.5 && bmiValue < 25) {
//             return 'Normal weight';
//         } else if (bmiValue >= 25 && bmiValue < 30) {
//             return 'Overweight';
//         } else if (bmiValue >= 30) {
//             return 'Obese';
//         }
//         return '';
//     };

//     const bmiCategory = bmi ? getBmiCategory(bmi) : '';

//     return (
//         <div className={`bmi-calculator-container ${showResults ? 'results-visible' : ''}`}>
//             <div className="calculator-section">
//                 <h2>BMI Calculator</h2>
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
//                 <div className="mb-3">
//                     <label htmlFor="weight" className="form-label">Weight:</label>
//                     <div className="input-group">
//                         <input type="number" className="form-control" id="weight" placeholder="Enter weight" value={weightUnit === 'kg' ? weightKg : weightLbs} onChange={(e) => {
//                             if (weightUnit === 'kg') setWeightKg(e.target.value);
//                             else setWeightLbs(e.target.value);
//                         }} />
//                         <button type="button" className="btn btn-outline-secondary unit-select-button dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
//                             {weightUnit}
//                         </button>
//                         <ul className="dropdown-menu dropdown-menu-end unit-dropdown-menu">
//                             <li><button className="dropdown-item" type="button" onClick={() => setWeightUnit('kg')}>kg</button></li>
//                             <li><button className="dropdown-item" type="button" onClick={() => setWeightUnit('lbs')}>lbs</button></li>
//                         </ul>
//                     </div>
//                 </div>
//                 <button className="btn btn-primary calculate-button" onClick={calculateBMI}>Calculate BMI</button>
//             </div>

//             {showResults && (
//                 <div className="results-section">
//                     <h3>BMI Results</h3>
//                     <p>Your BMI: <strong className="badge bg-info">{bmi}</strong></p>
//                     <h4>BMI Categories:</h4>
//                     <ul className="list-group">
//                         <li className={`list-group-item ${bmiCategory === 'Underweight' ? 'highlight' : ''}`}>Underweight: BMI less than 18.5</li>
//                         <li className={`list-group-item ${bmiCategory === 'Normal weight' ? 'highlight' : ''}`}>Normal weight: BMI 18.5 to 24.9</li>
//                         <li className={`list-group-item ${bmiCategory === 'Overweight' ? 'highlight' : ''}`}>Overweight: BMI 25 to 29.9</li>
//                         <li className={`list-group-item ${bmiCategory === 'Obese' ? 'highlight' : ''}`}>Obese: BMI 30 or greater</li>
//                     </ul>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default BMICalculator;



import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaWeight, FaRulerVertical, FaVenusMars, FaBirthdayCake, FaCalculator } from 'react-icons/fa';
import './BMICalculator.css';

const BMICalculator = () => {
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [heightUnit, setHeightUnit] = useState('cm');
    const [heightCm, setHeightCm] = useState('');
    const [heightFeet, setHeightFeet] = useState('');
    const [heightInches, setHeightInches] = useState('');
    const [weightUnit, setWeightUnit] = useState('kg');
    const [weightKg, setWeightKg] = useState('');
    const [weightLbs, setWeightLbs] = useState('');
    const [bmi, setBmi] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [touched, setTouched] = useState({
        age: false,
        gender: false,
        height: false,
        weight: false
    });

    const calculateBMI = () => {
        let heightInMeters;
        let weightInKg;

        // Validate inputs
        if (heightUnit === 'cm') {
            if (!heightCm || isNaN(heightCm) || heightCm <= 0) {
                setTouched(prev => ({ ...prev, height: true }));
                return;
            }
            heightInMeters = parseFloat(heightCm) / 100;
        } else {
            if ((!heightFeet || isNaN(heightFeet) || heightFeet <= 0) && 
                (!heightInches || isNaN(heightInches) || heightInches < 0)) {
                setTouched(prev => ({ ...prev, height: true }));
                return;
            }
            const feet = parseFloat(heightFeet) || 0;
            const inches = parseFloat(heightInches) || 0;
            heightInMeters = (feet * 0.3048) + (inches * 0.0254);
        }

        if (weightUnit === 'kg') {
            if (!weightKg || isNaN(weightKg) || weightKg <= 0) {
                setTouched(prev => ({ ...prev, weight: true }));
                return;
            }
            weightInKg = parseFloat(weightKg);
        } else {
            if (!weightLbs || isNaN(weightLbs) || weightLbs <= 0) {
                setTouched(prev => ({ ...prev, weight: true }));
                return;
            }
            weightInKg = parseFloat(weightLbs) * 0.453592;
        }

        if (heightInMeters > 0 && weightInKg > 0) {
            const calculatedBmi = weightInKg / (heightInMeters * heightInMeters);
            setBmi(parseFloat(calculatedBmi.toFixed(1)));
            setShowResults(true);
        }
    };

    const getBmiCategory = (bmiValue) => {
        if (bmiValue < 16) return 'Severe Thinness';
        if (bmiValue < 17) return 'Moderate Thinness';
        if (bmiValue < 18.5) return 'Mild Thinness';
        if (bmiValue < 25) return 'Normal';
        if (bmiValue < 30) return 'Overweight';
        if (bmiValue < 35) return 'Obese Class I';
        if (bmiValue < 40) return 'Obese Class II';
        return 'Obese Class III';
    };

    const getBmiColor = (bmiValue) => {
        if (bmiValue < 18.5) return '#3498db'; // Blue for underweight
        if (bmiValue < 25) return '#2ecc71';   // Green for normal
        if (bmiValue < 30) return '#f39c12';   // Orange for overweight
        return '#e74c3c';                      // Red for obese
    };

    const bmiCategory = bmi ? getBmiCategory(bmi) : '';
    const bmiColor = bmi ? getBmiColor(bmi) : '';

    const handleInputBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const resetForm = () => {
        setAge('');
        setGender('');
        setHeightCm('');
        setHeightFeet('');
        setHeightInches('');
        setWeightKg('');
        setWeightLbs('');
        setBmi(null);
        setShowResults(false);
        setTouched({
            age: false,
            gender: false,
            height: false,
            weight: false
        });
    };

    return (
        <div className="bmi-calculator-container">
            <div className="calculator-card">
                <div className="calculator-header">
                    <h2>
                        <FaCalculator className="me-2" />
                        BMI Calculator
                    </h2>
                    <p className="text-muted">Body Mass Index (BMI) is a measure of body fat based on height and weight</p>
                </div>

                <div className="calculator-body">
                    <div className="mb-4">
                        <label htmlFor="age" className="form-label">
                            <FaBirthdayCake className="me-2" />
                            Age (years)
                        </label>
                        <input
                            type="number"
                            className={`form-control ${touched.age && !age ? 'is-invalid' : ''}`}
                            id="age"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            onBlur={() => handleInputBlur('age')}
                            min="2"
                            max="120"
                        />
                        {touched.age && !age && (
                            <div className="invalid-feedback">Please enter your age</div>
                        )}
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
                            onChange={(e) => setGender(e.target.value)}
                            onBlur={() => handleInputBlur('gender')}
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
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
                                    onBlur={() => handleInputBlur('height')}
                                    min="50"
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
                                        onBlur={() => handleInputBlur('height')}
                                        min="1"
                                        max="10"
                                    />
                                    <input
                                        type="number"
                                        className={`form-control ${touched.height && !heightInches ? 'is-invalid' : ''}`}
                                        placeholder="Inches"
                                        value={heightInches}
                                        onChange={(e) => setHeightInches(e.target.value)}
                                        onBlur={() => handleInputBlur('height')}
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
                         (heightUnit === 'feet' && !heightFeet && !heightInches)) && (
                            <div className="invalid-feedback d-block">Please enter your height</div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="form-label">
                            <FaWeight className="me-2" />
                            Weight
                        </label>
                        <div className="input-group">
                            <input
                                type="number"
                                className={`form-control ${touched.weight && ((weightUnit === 'kg' && !weightKg) || (weightUnit === 'lbs' && !weightLbs)) ? 'is-invalid' : ''}`}
                                placeholder={`Enter weight in ${weightUnit}`}
                                value={weightUnit === 'kg' ? weightKg : weightLbs}
                                onChange={(e) => {
                                    if (weightUnit === 'kg') setWeightKg(e.target.value);
                                    else setWeightLbs(e.target.value);
                                }}
                                onBlur={() => handleInputBlur('weight')}
                                min="10"
                                max="500"
                            />
                            <button
                                className="btn btn-outline-secondary dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                {weightUnit}
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                    <button
                                        className="dropdown-item"
                                        type="button"
                                        onClick={() => {
                                            setWeightUnit('kg');
                                            setWeightLbs('');
                                        }}
                                    >
                                        Kilograms (kg)
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item"
                                        type="button"
                                        onClick={() => {
                                            setWeightUnit('lbs');
                                            setWeightKg('');
                                        }}
                                    >
                                        Pounds (lbs)
                                    </button>
                                </li>
                            </ul>
                        </div>
                        {touched.weight && ((weightUnit === 'kg' && !weightKg) || (weightUnit === 'lbs' && !weightLbs)) && (
                            <div className="invalid-feedback d-block">Please enter your weight</div>
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
                            onClick={calculateBMI}
                            disabled={!age || !gender || 
                                     (heightUnit === 'cm' ? !heightCm : (!heightFeet && !heightInches)) || 
                                     (weightUnit === 'kg' ? !weightKg : !weightLbs)}
                        >
                            Calculate BMI
                        </button>
                    </div>
                </div>
            </div>

            {showResults && (
                <div className="results-card">
                    <div className="results-header">
                        <h3>Your BMI Results</h3>
                    </div>
                    <div className="results-body">
                        <div className="bmi-value-container">
                            <div className="bmi-value" style={{ color: bmiColor }}>
                                {bmi}
                            </div>
                            <div className="bmi-category" style={{ backgroundColor: bmiColor }}>
                                {bmiCategory}
                            </div>
                        </div>

                        <div className="bmi-scale-container">
                            <div className="bmi-scale">
                                <div className="scale-segment underweight">
                                    <span>&lt;18.5</span>
                                    <div className={`segment-label ${bmiCategory.includes('Thinness') ? 'active' : ''}`}>
                                        Underweight
                                    </div>
                                </div>
                                <div className="scale-segment normal">
                                    <span>18.5-24.9</span>
                                    <div className={`segment-label ${bmiCategory === 'Normal' ? 'active' : ''}`}>
                                        Normal
                                    </div>
                                </div>
                                <div className="scale-segment overweight">
                                    <span>25-29.9</span>
                                    <div className={`segment-label ${bmiCategory === 'Overweight' ? 'active' : ''}`}>
                                        Overweight
                                    </div>
                                </div>
                                <div className="scale-segment obese">
                                    <span>30+</span>
                                    <div className={`segment-label ${bmiCategory.includes('Obese') ? 'active' : ''}`}>
                                        Obese
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bmi-interpretation">
                            <h5>What your BMI means:</h5>
                            <p>
                                {bmi < 18.5 ? (
                                    "You are underweight. Consider consulting with a healthcare provider about gaining weight in a healthy way."
                                ) : bmi < 25 ? (
                                    "You have a normal body weight. Good job maintaining a healthy lifestyle!"
                                ) : bmi < 30 ? (
                                    "You are overweight. Consider lifestyle changes to reduce your weight for better health."
                                ) : (
                                    "You are obese. It's recommended to consult with a healthcare provider about weight management strategies."
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BMICalculator;