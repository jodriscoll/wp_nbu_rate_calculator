/**
 * Rate Calculator Logic
 *
 * @package nbu
 */

const Decimal = require('decimal.js-light');

/**
 * Maps select-input value to classes of panels that should be visible
 * */
const serviceTypeMapping = {
	'water-wastewater-electric': [
		'electricity',
		'water-home-use',
		'wastewater'
	],
	'water-wastewater': [
		'water-home-use',
		'wastewater'
	],
	'water-electric': [
		'water-home-use',
		'electricity'
	],
	'wastewater-electric': [
		'electricity',
		'wastewater'
	],
	'water-only': [
		'water-home-use'
	],
	'wastewater-only': [
		'wastewater'
	],
	'electric-only': [
		'electricity'
	]
};

let activePanelIndex = 0;
let cumulativeEnterFailures = 0;
let panelElements = [];
let proceedButtons = [];
let stepTwoServices = [];
let activeStepTwoServices = [];
let calculatorElement;
let formElement;
let serviceInput;
let seasonInput;
let serviceKey;

let activeCalculations = {};

let validatedElectric;
let validatedWater;
let validatedWastewater;


function init() {
	calculatorElement = document.querySelector('.rate-calculator');
	formElement = calculatorElement.querySelector('form');
	formElement.addEventListener('focusout', function() {
		if (cumulativeEnterFailures) {
			formElement.reportValidity();
		}
	});

	let valuesElementCount = 0;
	let validatedMathObjectsCount = 0;

	let electricValuesElement = calculatorElement.querySelector('.electric-values');
	if (electricValuesElement) {
		valuesElementCount++;
		let electricRequiredValues = {
			offPeakPowerRate: returnElementContents('.off_peak_power_rate', electricValuesElement),
			peakPowerRate: returnElementContents('.peak_power_rate', electricValuesElement),
			powerRecoveryCost: returnElementContents('.power_recovery_cost', electricValuesElement),
			powerDeliveryCharge: returnElementContents('.power_delivery_charge', electricValuesElement),
			electricAvailabilityCharge: returnElementContents('.electric_availability_charge', electricValuesElement)
		};
		electricValuesElement.parentElement.removeChild(electricValuesElement);
		validatedElectric = validateMathObject(electricRequiredValues);
		if (!validatedElectric) {
			//console.log('required electric value missing');
		} else {
			validatedMathObjectsCount++;
			activeCalculations['purchasedPower'] = {
				'title' : 'Purchased Power',
				'titleValueTrail' : 'kWh'
			};
			activeCalculations['powerCostRecoveryAdjustment'] = {
				'title' : 'Power Cost Recovery Adjustment',
				'titleValueTrail' : ''
			};
			activeCalculations['deliveredPower'] = {
				'title' : 'Delivered Power',
				'titleValueTrail' : 'kWh'
			};
			activeCalculations['electricAvailability'] = {
				'title' : 'Electric Availability',
				'titleValueTrail' : ''
			};
			activeCalculations['totalElectric'] = {
				'title' : 'Total Electricity Charges',
				'titleValueTrail' : ''
			};
		}
	}

	let wastewaterValuesElement = calculatorElement.querySelector('.wastewater-values');
	if (wastewaterValuesElement) {
		valuesElementCount++;
		let wastewaterRequiredValues = {
			wastewaterAvailabilityCharge: returnElementContents('.wastewater_availability_charge', wastewaterValuesElement),
			wastewaterCostPerGallon: returnElementContents('.wastewater_cost_per_gallon', wastewaterValuesElement),
			maximumTotalWasteWaterCharge: returnElementContents('.maximum_total_wastewater_charge', wastewaterValuesElement),
			nonNBUWaterServiceFee: returnElementContents('.non_nbu_water_service_fee', wastewaterValuesElement),
		}
		wastewaterValuesElement.parentElement.removeChild(wastewaterValuesElement);
		validatedWastewater = validateMathObject(wastewaterRequiredValues);
		if (!validatedWastewater) {
			//console.log('required wastewater value missing');
		} else {
			validatedMathObjectsCount++;
			activeCalculations['wastewaterUsage'] = {
				'title' : 'Wastewater',
				'titleValueTrail' : 'gal'
			};
			activeCalculations['wastewaterAvailability'] = {
				'title' : 'Wastewater Availability',
				'titleValueTrail' : ''
			};
			activeCalculations['nonNBUWaterServiceFee'] = {
				'title' : 'Non-NBU Water Service Fee',
				'titleValueTrail' : ''
			};
			activeCalculations['totalWastewater'] = {
				'title' : 'Total Wastewater Charges',
				'titleValueTrail' : ''
			};
		}
	}

	let waterValuesElement = calculatorElement.querySelector('.water-values');
	if (waterValuesElement) {
		valuesElementCount++;
		let waterRequiredValues = {
			tierOneOffPeakResidentialWaterRate: returnElementContents('.tier_one_off_peak_residential_water_rate', waterValuesElement),
			tierOnePeakResidentialWaterRate: returnElementContents('.tier_one_peak_residential_water_rate', waterValuesElement),
			tierTwoOffPeakResidentialWaterRate: returnElementContents('.tier_two_off_peak_residential_water_rate', waterValuesElement),
			tierTwoPeakResidentialWaterRate: returnElementContents('.tier_two_peak_residential_water_rate', waterValuesElement),
			tierThreeOffPeakResidentialWaterRate: returnElementContents('.tier_three_off_peak_residential_water_rate', waterValuesElement),
			tierThreePeakResidentialWaterRate: returnElementContents('.tier_three_peak_residential_water_rate', waterValuesElement),
			tierFourOffPeakResidentialWaterRate: returnElementContents('.tier_four_off_peak_residential_water_rate', waterValuesElement),
			tierFourPeakResidentialWaterRate: returnElementContents('.tier_four_peak_residential_water_rate', waterValuesElement),
			tierOneOffPeakIrrigationWaterRate: returnElementContents('.tier_one_off_peak_irrigation_water_rate', waterValuesElement),
			tierOnePeakIrrigationWaterRate: returnElementContents('.tier_one_peak_irrigation_water_rate', waterValuesElement),
			tierTwoOffPeakIrrigationWaterRate: returnElementContents('.tier_two_off_peak_irrigation_water_rate', waterValuesElement),
			tierTwoPeakIrrigationWaterRate: returnElementContents('.tier_two_peak_irrigation_water_rate', waterValuesElement),
			tierThreeOffPeakIrrigationWaterRate: returnElementContents('.tier_three_off_peak_irrigation_water_rate', waterValuesElement),
			tierThreePeakIrrigationWaterRate: returnElementContents('.tier_three_peak_irrigation_water_rate', waterValuesElement),
			waterSupplyFeeRate: returnElementContents('.water_supply_fee_rate', waterValuesElement),
			stageThreeDroughtRate: returnElementContents('.stage_three_drought_rate', waterValuesElement),
			stageFourDroughtRate: returnElementContents('.stage_four_drought_rate', waterValuesElement)
		};
		waterValuesElement.parentElement.removeChild(waterValuesElement);
		validatedWater = validateMathObject(waterRequiredValues);
		if (!validatedWater) {
			//console.log('required water value missing');
		} else {
			validatedMathObjectsCount++;
			activeCalculations['waterUsage'] = {
				'title' : 'Water Usage',
				'titleValueTrail' : 'gal'
			};
			activeCalculations['irrigation'] = {
				'title' : 'Irrigation',
				'titleValueTrail' : 'gal'
			};
			activeCalculations['waterAvailabilityCharge'] = {
				'title' : 'Water Availability Charge',
				'titleValueTrail' : ''
			};
			activeCalculations['waterSupplyFee'] = {
				'title' : 'Water Supply Fee',
				'titleValueTrail' : 'gal'
			};
			activeCalculations['droughtSurcharge'] = {
				'title' : 'Drought Surcharge',
				'titleValueTrail' : ''
			};
			activeCalculations['totalWaterCost'] = {
				'title' : 'Total Water Charges',
				'titleValueTrail' : ''
			};
		}
	}

	if (valuesElementCount === validatedMathObjectsCount) {
		setTimeout(() => {
			if (calculatorElement) {
				panelElements = calculatorElement.querySelectorAll('.rate-calculator__panel');
				removePreloader();
				if (panelElements.length) {
					serviceInput = calculatorElement.querySelector('#rc-service-selector');
					seasonInput = calculatorElement.querySelector('#rates-seasons');
					stepTwoServices = calculatorElement.querySelectorAll('.rate-calculator__service');
				}

				proceedButtons = calculatorElement.querySelectorAll('.js-rc-btn-next');
				if (proceedButtons.length) {
					disableProceedButtons();
					addProceedListeners();
				}

				let reloadButton = document.querySelector('.js-rc-btn-restart');
				if (reloadButton) {
					reloadButton.addEventListener('click', function() {
						if (serviceInput && serviceInput.options && serviceInput.options.length) {
							serviceInput.options[0].selected = true;
						}
						if (seasonInput && seasonInput.options && seasonInput.options.length) {
							seasonInput.options[0].selected = true;
						}
						let irrigationOptions = document.querySelectorAll('#has-irrigation input');
						for (let i = 0; i < irrigationOptions.length; i++) {
							irrigationOptions[i].checked = false;
						}
						let droughtStageElement = document.getElementById('drought-stage');
						if (droughtStageElement) {
							if (droughtStageElement.options && droughtStageElement.options.length) {
								droughtStageElement.options[droughtStageElement.options.length - 1].selected = true;
							}
						}
						let meterSizeHomeElement = document.getElementById('meter-size-water-home-use');
						if (meterSizeHomeElement) {
							if (meterSizeHomeElement && meterSizeHomeElement.options && meterSizeHomeElement.options.length) {
								meterSizeHomeElement.options[0].selected = true;
							}
						}
						let meterSizeIrrigationElement = document.getElementById('meter-size-water-irrigation');
						if (meterSizeIrrigationElement) {
							if (meterSizeIrrigationElement && meterSizeIrrigationElement.options && meterSizeIrrigationElement.options.length) {
								meterSizeIrrigationElement.options[0].selected = true;
							}
						}
						let homeUseElement = document.getElementById('monthly-water-volume-water-home-use');
						if (homeUseElement) {
							homeUseElement.value = '';
						}
						let irrigationElement = document.getElementById('monthly-water-volume-irrigation');
						if (irrigationElement) {
							irrigationElement.value = '';
						}
						let electricElement = document.getElementById('monthly-power-usage');
						if (electricElement) {
							electricElement.value = '';
						}
						let wastewaterElement = document.getElementById('wastewater-usage');
						if (wastewaterElement) {
							wastewaterElement.value = '';
						}
						activePanelIndex = 0;
						formToActiveIndex();
					});
				}

				let backButton = document.querySelector('.js-rc-btn-back');
				if (backButton) {
					backButton.addEventListener('click', function() {
						if (activePanelIndex === 2) {
							activePanelIndex = 1;
						} else if (activePanelIndex === 1) {
							activePanelIndex = 0;
						}
						formToActiveIndex();
					});
				}

				addInputChangeListener(calculatorElement);
				let hasIrrigationElement = document.getElementById('has-irrigation');
				if (hasIrrigationElement) {
					hasIrrigationElement.addEventListener('click', function() {
						toggleStepTwoServices();
						onInputChangeAndStepArrival();
					});
				}
			}
		}, 200);
	}
}


function returnDecimalFromInputID(selectorID) {
	let inputElement = document.getElementById(selectorID);
	if (inputElement) {
		let inputValue = inputElement.value;
		if (inputValue !== '') {
			let asNumber = Number(inputValue);
			if (asNumber > 0) {
				return new Decimal(asNumber);
			} else {
				return new Decimal(0);
			}
		}
	}
}

let wastewaterCost = null;
let totalElectric = null;
let totalWastewater = null;
let totalWaterCost = null;
let finalTotal = new Decimal(0);

function returnResultsString(ratesSeasonsElement) {
	let monthlyPowerUsageDecimal = null;
	let wastewaterUsageDecimal = null;
	let waterUsageDecimal = null;
	let irrigationUsageDecimal = null;
	finalTotal = new Decimal(0);
	if (validatedElectric) {
		totalElectric = new Decimal(0);
		monthlyPowerUsageDecimal = returnDecimalFromInputID('monthly-power-usage');
	}

	if (validatedWater) {
		totalWaterCost = new Decimal(0);
		waterUsageDecimal = returnDecimalFromInputID('monthly-water-volume-water-home-use');
		irrigationUsageDecimal = returnDecimalFromInputID('monthly-water-volume-irrigation');
	}

	if (validatedWastewater) {
		totalWastewater = new Decimal(0);
		wastewaterCost = new Decimal(0);
		wastewaterUsageDecimal = returnDecimalFromInputID('wastewater-usage');
	}

	let stringToReturn = '';
	for (let key in activeCalculations) {
		if (key === 'purchasedPower') {
			if (monthlyPowerUsageDecimal) {
				stringToReturn += '<div class="service-callout service-callout--result electricity"><i class="callout-icon__icon callout-icon__icon--orange icon icon-electric"></i><h4 class="title">Electricity</h4></div>';
				stringToReturn += '<div class="result-group-label">Power Supply</div>';
			}
			stringToReturn += returnPurchasedPowerString(activeCalculations[key], ratesSeasonsElement, validatedElectric, monthlyPowerUsageDecimal);
		} else if (key === 'powerCostRecoveryAdjustment') {
			stringToReturn += returnPCRAString(activeCalculations[key], monthlyPowerUsageDecimal, validatedElectric);
		} else if (key === 'deliveredPower') {
			if (monthlyPowerUsageDecimal) {
				stringToReturn += '<div class="result-group-label">Delivery</div>';
			}
			stringToReturn += returnDeliveredPowerString(activeCalculations[key], monthlyPowerUsageDecimal, validatedElectric);
		} else if (key === 'electricAvailability') {
			stringToReturn += returnElectricAvailabilityString(activeCalculations[key], monthlyPowerUsageDecimal, validatedElectric);
		} else if (key === 'totalElectric') {
			if (totalElectric && monthlyPowerUsageDecimal) {
				stringToReturn += '<div class="result-group-label">Taxes</div>';
				stringToReturn+= '<div class="result"><span class="result__label">Taxes are listed on your bill</span></div>';
				stringToReturn+= '<div class="result result--total"><span class="result__label">' + activeCalculations[key].title + '</span><span class="price">' + decimalToMoneyWithCommas(totalElectric) + '</span></div>';
			}
		} else if (key === 'waterUsage') {
			if (waterUsageDecimal) {
				stringToReturn += '<div class="service-callout service-callout--result water-home-use"><i class="callout-icon__icon callout-icon__icon--whu-blue icon icon-water-1"></i><h4 class="title">Water Use</h4></div>';
			}
			stringToReturn += returnWaterUsageString(activeCalculations[key], waterUsageDecimal, ratesSeasonsElement, validatedWater);
		} else if (key === 'irrigation') {
			stringToReturn += returnIrrigationUsageString(activeCalculations[key], irrigationUsageDecimal, ratesSeasonsElement, validatedWater);
		} else if (key === 'waterAvailabilityCharge') {
			stringToReturn += returnWaterAvailabilityString(activeCalculations[key], waterUsageDecimal);
		} else if (key === 'waterSupplyFee') {
			stringToReturn += returnWaterSupplyFeeString(activeCalculations[key], waterUsageDecimal, irrigationUsageDecimal, validatedWater);
		} else if (key === 'droughtSurcharge') {
			stringToReturn += returnDroughtSurchargeString(activeCalculations[key], waterUsageDecimal, irrigationUsageDecimal, validatedWater);
		} else if (key === 'totalWaterCost') {
			if (totalWaterCost && waterUsageDecimal) {
				stringToReturn+= '<div class="result result--total"><span class="result__label">' + activeCalculations[key].title + '</span><span class="price">' + decimalToMoneyWithCommas(totalWaterCost) + '</span></div>';
			}
			stringToReturn+= '<div class="service-callout service-callout--result city-services"><i class="callout-icon__icon callout-icon__icon--gray icon icon-alert"></i><div class="title">City Services</div></div><div class="result result--note">City charges are excluded from calculator, to review City charges see your NBU bill.</div>';
		} else if (key === 'wastewaterUsage') {
			if (wastewaterUsageDecimal) {
				stringToReturn += '<div class="service-callout service-callout--result wastewater"><i class="callout-icon__icon callout-icon__icon--green icon icon-waste-water"></i><h4 class="title">Wastewater</h4></div>';
			}
			stringToReturn+= returnWastewaterUsageString(activeCalculations[key], wastewaterUsageDecimal, waterUsageDecimal, validatedWastewater);
		} else if (key === 'wastewaterAvailability') {
			stringToReturn+= returnWastewaterAvailabilityString(activeCalculations[key], wastewaterUsageDecimal, waterUsageDecimal, validatedWastewater);
		} else if (key === 'nonNBUWaterServiceFee') {
			if (wastewaterUsageDecimal) {
				stringToReturn+= returnNonNBUWaterServiceFee(activeCalculations[key], waterUsageDecimal, validatedWastewater);
			}
		} else if (key === 'totalWastewater') {
			if (totalWastewater && wastewaterUsageDecimal) {
				stringToReturn+= '<div class="result result--total"><span class="result__label">' + activeCalculations[key].title + '</span><span class="price">' + decimalToMoneyWithCommas(totalWastewater) + '</span></div>';
			}
		}
	}
	if (totalElectric) {
		finalTotal = finalTotal.plus(totalElectric.toFixed(2));
	}
	if (totalWaterCost) {
		finalTotal = finalTotal.plus(totalWaterCost.toFixed(2));
	}
	if (totalWastewater) {
		finalTotal = finalTotal.plus(totalWastewater.toFixed(2));
	}
	stringToReturn+= '<div class="final-result"><div class="result"><span class="result__label">Total NBU Service Charges</span><span class="price">' + decimalToMoneyWithCommas(finalTotal) + '</span></div></div>';
	return stringToReturn;
}

function returnPurchasedPowerString(activeCalculation, ratesSeasonsElement, validatedElectric, monthlyPowerUsageDecimal) {
	if (ratesSeasonsElement && ratesSeasonsElement.value) {
		let multiplier;
		if (ratesSeasonsElement.value === 'off-peak-october-through-may') {
			multiplier = validatedElectric.offPeakPowerRate;
		} else if (ratesSeasonsElement.value === 'peak-june-through-september') {
			multiplier = validatedElectric.peakPowerRate;
		}
		if (multiplier) {
			if (monthlyPowerUsageDecimal) {
				let monthlyPowerUsageCost = monthlyPowerUsageDecimal.times(multiplier);
				totalElectric = totalElectric.plus(monthlyPowerUsageCost.toFixed(2));
				return '<div class="result"><span class="result__label">' + activeCalculation.title + ' ' + decimalToMoneyWithCommas(monthlyPowerUsageDecimal, false) + ' ' + activeCalculation.titleValueTrail + '</span>' + decimalToMoneyWithCommas(monthlyPowerUsageCost) + '</div>';
			}
		}
	}
	return '';
}

function returnPCRAString(activeCalculation, monthlyPowerUsageDecimal, validatedElectric) {
	if (monthlyPowerUsageDecimal) {
		let pcraCost = monthlyPowerUsageDecimal.times(validatedElectric.powerRecoveryCost);
		totalElectric = totalElectric.plus(pcraCost.toFixed(2));
		return '<div class="result"><span class="result__label">' + activeCalculation.title + '</span>' + decimalToMoneyWithCommas(pcraCost) + '</div>';
	}
	return '';
}

function returnDeliveredPowerString(activeCalculation, monthlyPowerUsageDecimal, validatedElectric) {
	if (monthlyPowerUsageDecimal) {
		let deliveredPowerCost = monthlyPowerUsageDecimal.times(validatedElectric.powerDeliveryCharge);
		totalElectric = totalElectric.plus(deliveredPowerCost.toFixed(2));
		return '<div class="result"><span class="result__label">' + activeCalculation.title + ' ' + decimalToMoneyWithCommas(monthlyPowerUsageDecimal, false) + ' ' + activeCalculation.titleValueTrail + '</span>' + decimalToMoneyWithCommas(deliveredPowerCost) + '</div>';
	}
	return '';
}

function returnElectricAvailabilityString(activeCalculation, monthlyPowerUsageDecimal, validatedElectric) {
	if (monthlyPowerUsageDecimal) {
		let electricAvailabilityCharge = validatedElectric.electricAvailabilityCharge;
		totalElectric = totalElectric.plus(electricAvailabilityCharge.toFixed(2));
		return '<div class="result"><span class="result__label">' + activeCalculation.title + '</span>' + decimalToMoneyWithCommas(electricAvailabilityCharge) + '</div>';
	}
	return '';
}

function returnWaterUsageString(activeCalculation, waterUsageDecimal, ratesSeasonsElement, validatedWater) {
	if (waterUsageDecimal) {
		if (ratesSeasonsElement && ratesSeasonsElement.value) {
			let isPeak = (ratesSeasonsElement.value === 'peak-june-through-september');
			let waterUsageCost = returnTieredWaterTotal(waterUsageDecimal, isPeak, false, validatedWater);
			totalWaterCost = totalWaterCost.plus(waterUsageCost.toFixed(2));
			return '<div class="result"><span class="result__label">' + activeCalculation.title + ' ' + decimalToMoneyWithCommas(waterUsageDecimal, false) + ' ' + activeCalculation.titleValueTrail + '</span>' + decimalToMoneyWithCommas(waterUsageCost) + '</div>';
		}
	}
	return '';
}

function returnIrrigationUsageString(activeCalculation, irrigationUsageDecimal, ratesSeasonsElement, validatedWater) {
	if (irrigationUsageDecimal) {
		if (ratesSeasonsElement && ratesSeasonsElement.value) {
			let isPeak = (ratesSeasonsElement.value === 'peak-june-through-september');
			let waterUsageCost = returnTieredWaterTotal(irrigationUsageDecimal, isPeak, true, validatedWater);
			totalWaterCost = totalWaterCost.plus(waterUsageCost.toFixed(2));
			return '<div class="result"><span class="result__label">' + activeCalculation.title + ' ' + decimalToMoneyWithCommas(irrigationUsageDecimal, false) + ' ' + activeCalculation.titleValueTrail + '</span>' + decimalToMoneyWithCommas(waterUsageCost) + '</div>';
		}
	}
	return '';
}

function returnWaterAvailabilityString(activeCalculation, waterUsageDecimal) {
	if (waterUsageDecimal) {
		let meterCharge = returnDecimalFromInputID('meter-size-water-home-use');
		let irrigationYesElement = document.getElementById('yes-irrigation');
		if (irrigationYesElement && irrigationYesElement.checked) {
			let irrigationWaterMeterCharge = returnDecimalFromInputID('meter-size-water-irrigation');
			meterCharge = meterCharge.plus(irrigationWaterMeterCharge);
		}
		totalWaterCost = totalWaterCost.plus(meterCharge.toFixed(2));
		return '<div class="result"><span class="result__label">' + activeCalculation.title + '</span>' + decimalToMoneyWithCommas(meterCharge) + '</div>';
	}
	return '';
}

function returnWaterSupplyFeeString(activeCalculation, waterUsageDecimal, irrigationUsageDecimal, validatedWater) {
	if (waterUsageDecimal || irrigationUsageDecimal) {
		if (!waterUsageDecimal) {
			waterUsageDecimal = new Decimal(0);
		}
		if (!irrigationUsageDecimal) {
			irrigationUsageDecimal = new Decimal(0);
		}
		let decimal7500 = new Decimal(7500);
		if (waterUsageDecimal.greaterThan(decimal7500)) {
			waterUsageDecimal = waterUsageDecimal.minus(decimal7500);
		} else {
			waterUsageDecimal = new Decimal(0);
		}
		let combinedUse = waterUsageDecimal.plus(irrigationUsageDecimal);
		let supplyFee = combinedUse.times(validatedWater.waterSupplyFeeRate);
		totalWaterCost = totalWaterCost.plus(supplyFee.toFixed(2));
		return '<div class="result"><span class="result__label">' + activeCalculation.title + ' ' + decimalToMoneyWithCommas(combinedUse, false) + ' ' + activeCalculation.titleValueTrail + '</span>' + decimalToMoneyWithCommas(supplyFee) + '</div>';
	}
	return '';
}

function returnDroughtSurchargeString(activeCalculation, waterUsageDecimal, irrigationUsageDecimal, validatedWater) {
	if (waterUsageDecimal) {
		let droughtStageElement = document.getElementById('drought-stage');
		if (droughtStageElement) {
			let droughtStageString = droughtStageElement.options[droughtStageElement.selectedIndex].text;
			let totalDroughtSurcharge = new Decimal(0);
			if (droughtStageString === 'Stage 3' || droughtStageString === 'Stage 4') {
				let droughtRate = validatedWater.stageThreeDroughtRate;
				if (droughtStageString === 'Stage 4') {
					droughtRate = validatedWater.stageFourDroughtRate;
				}
				let decimal7500 = new Decimal(7500);
				let decimal15000 = new Decimal(15000);
				let droughtChargeFromResidential = new Decimal(0);
				let droughtChargeFromIrrigation = new Decimal(0);
				if (waterUsageDecimal.greaterThan(decimal15000)) {
					droughtChargeFromResidential = waterUsageDecimal.minus(decimal15000).times(droughtRate);
					totalDroughtSurcharge = totalDroughtSurcharge.plus(droughtChargeFromResidential.toFixed(2));
				}
				if (irrigationUsageDecimal && irrigationUsageDecimal.greaterThan(decimal7500)) {
					droughtChargeFromIrrigation = irrigationUsageDecimal.minus(decimal7500).times(droughtRate);
					totalDroughtSurcharge = totalDroughtSurcharge.plus(droughtChargeFromIrrigation.toFixed(2));
				}
				totalWaterCost = totalWaterCost.plus(totalDroughtSurcharge.toFixed(2));
			}
			return '<div class="result"><span class="result__label">' + activeCalculation.title + '</span>' + decimalToMoneyWithCommas(totalDroughtSurcharge) + '</div>';
		}
	}
	return '';
}

function returnWastewaterUsageString(activeCalculation, wastewaterUsageDecimal, waterUsageDecimal, validatedWastewater) {
	if (waterUsageDecimal) {
		if (wastewaterUsageDecimal) {
			wastewaterCost = validatedWastewater.wastewaterCostPerGallon.times(wastewaterUsageDecimal);
			if (wastewaterCost.greaterThan(validatedWastewater.maximumTotalWasteWaterCharge)) {
				wastewaterCost = validatedWastewater.maximumTotalWasteWaterCharge;
			}
			totalWastewater = totalWastewater.plus(wastewaterCost.toFixed(2));
			return '<div class="result"><span class="result__label">' + activeCalculation.title + ' ' + decimalToMoneyWithCommas(wastewaterUsageDecimal, false) + ' ' + activeCalculation.titleValueTrail + '</span>' + decimalToMoneyWithCommas(wastewaterCost) + '</div>';
		}
	}
	return '';
}

function returnWastewaterAvailabilityString(activeCalculation, wastewaterUsageDecimal, waterUsageDecimal, validatedWastewater) {
	if (waterUsageDecimal) {
		if (wastewaterUsageDecimal) {
			totalWastewater = totalWastewater.plus(validatedWastewater.wastewaterAvailabilityCharge.toFixed(2));
			return '<div class="result"><span class="result__label">' + activeCalculation.title + '</span>' + decimalToMoneyWithCommas(validatedWastewater.wastewaterAvailabilityCharge) + '</div>';
		}
	}
	return '';
}

function returnNonNBUWaterServiceFee(activeCalculation, waterUsageDecimal, validatedWastewater) {
	if (!waterUsageDecimal) {
		totalWastewater = totalWastewater.plus(validatedWastewater.nonNBUWaterServiceFee.toFixed(2));
		return '<div class="result"><span class="result__label">' + activeCalculation.title + '</span>' + decimalToMoneyWithCommas(validatedWastewater.nonNBUWaterServiceFee) + '</div>';
	}
	return '';
}

function returnTieredWaterTotal(numberGallons, isPeak, isIrr, validatedWater) {
	let decimalToReturn = new Decimal('0');
	let decimal25000 = new Decimal('25000');
	let decimal7500 = new Decimal('7500');
	let decimal10000 = new Decimal('10000');
	let decimal17500 = new Decimal('17500');
	let decimal15000 = new Decimal('15000');
	if (isIrr) {
		if (isPeak) {
			let full7500 = decimal7500.times(validatedWater.tierOnePeakIrrigationWaterRate);
			let fullMid = decimal17500.times(validatedWater.tierTwoPeakIrrigationWaterRate);
			if (numberGallons.greaterThan(decimal25000)) {
				let over25000Decimal = numberGallons.minus(decimal25000);
				let caseAmount = over25000Decimal.times(validatedWater.tierThreePeakIrrigationWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
				decimalToReturn = decimalToReturn.plus(full7500);
				decimalToReturn = decimalToReturn.plus(fullMid);
			} else if (numberGallons.greaterThan(decimal7500)) {
				let over7500Decimal = numberGallons.minus(decimal7500);
				let caseAmount = over7500Decimal.times(validatedWater.tierTwoPeakIrrigationWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
				decimalToReturn = decimalToReturn.plus(full7500);
			} else {
				let caseAmount = numberGallons.times(validatedWater.tierOnePeakIrrigationWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
			}
		} else {
			let full7500 = decimal7500.times(validatedWater.tierOneOffPeakIrrigationWaterRate);
			let fullMid = decimal17500.times(validatedWater.tierTwoOffPeakIrrigationWaterRate);
			if (numberGallons.greaterThan(decimal25000)) {
				let over25000Decimal = numberGallons.minus(decimal25000);
				let caseAmount = over25000Decimal.times(validatedWater.tierThreeOffPeakIrrigationWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
				decimalToReturn = decimalToReturn.plus(full7500);
				decimalToReturn = decimalToReturn.plus(fullMid);
			} else if (numberGallons.greaterThan(decimal7500)) {
				let over7500Decimal = numberGallons.minus(decimal7500);
				let caseAmount = over7500Decimal.times(validatedWater.tierTwoOffPeakIrrigationWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
				decimalToReturn = decimalToReturn.plus(full7500);
			} else {
				let caseAmount = numberGallons.times(validatedWater.tierOneOffPeakIrrigationWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
			}
		}
	} else {
		//residential, not irrigation
		if (isPeak) {
			let full7500 = decimal7500.times(validatedWater.tierOnePeakResidentialWaterRate);
			let fullLowMid = decimal7500.times(validatedWater.tierTwoPeakResidentialWaterRate);
            let fullHighMid = decimal10000.times(validatedWater.tierThreePeakResidentialWaterRate);
			if (numberGallons.greaterThan(decimal25000)) {
				let over25000Decimal = numberGallons.minus(decimal25000);
				let caseAmount = over25000Decimal.times(validatedWater.tierFourPeakResidentialWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
				decimalToReturn = decimalToReturn.plus(fullHighMid);
				decimalToReturn = decimalToReturn.plus(fullLowMid);
				decimalToReturn = decimalToReturn.plus(full7500);
			} else if (numberGallons.greaterThan(decimal15000)) {
				let over15000Decimal = numberGallons.minus(decimal15000);
				let caseAmount = over15000Decimal.times(validatedWater.tierThreePeakResidentialWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
				decimalToReturn = decimalToReturn.plus(fullLowMid);
				decimalToReturn = decimalToReturn.plus(full7500);
			} else if (numberGallons.greaterThan(decimal7500)) {
				let over7500Decimal = numberGallons.minus(decimal7500);
				let caseAmount = over7500Decimal.times(validatedWater.tierTwoPeakResidentialWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
				decimalToReturn = decimalToReturn.plus(full7500);
			} else {
				let caseAmount = numberGallons.times(validatedWater.tierOnePeakResidentialWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
			}
		} else {
			let full7500 = decimal7500.times(validatedWater.tierOneOffPeakResidentialWaterRate);
			let fullLowMid = decimal7500.times(validatedWater.tierTwoOffPeakResidentialWaterRate);
            let fullHighMid = decimal10000.times(validatedWater.tierThreeOffPeakResidentialWaterRate);
			if (numberGallons.greaterThan(decimal25000)) {
				let over25000Decimal = numberGallons.minus(decimal25000);
				let caseAmount = over25000Decimal.times(validatedWater.tierFourOffPeakResidentialWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
				decimalToReturn = decimalToReturn.plus(fullHighMid);
				decimalToReturn = decimalToReturn.plus(fullLowMid);
				decimalToReturn = decimalToReturn.plus(full7500);
			} else if (numberGallons.greaterThan(decimal15000)) {
				let over15000Decimal = numberGallons.minus(decimal15000);
				let caseAmount = over15000Decimal.times(validatedWater.tierThreeOffPeakResidentialWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
				decimalToReturn = decimalToReturn.plus(fullLowMid);
				decimalToReturn = decimalToReturn.plus(full7500);
			} else if (numberGallons.greaterThan(decimal7500)) {
				let over7500Decimal = numberGallons.minus(decimal7500);
				let caseAmount = over7500Decimal.times(validatedWater.tierTwoOffPeakResidentialWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
				decimalToReturn = decimalToReturn.plus(full7500);
			} else {
				let caseAmount = numberGallons.times(validatedWater.tierOneOffPeakResidentialWaterRate);
				decimalToReturn = decimalToReturn.plus(caseAmount);
			}
		}
	}
	return decimalToReturn;
}

function disableProceedButtons() {
	for(let i = 0; i < proceedButtons.length; i++) {
		proceedButtons[i].setAttribute('disabled', true);
	}
}

function validateMathObject(mathObject) {
	let validThreshold = Object.keys(mathObject).length;
	let isValid = false;
	let passCount = 0;
	let objectToReturn = {};
	for(let key in mathObject) {
		if(mathObject[key]) {
			let asNumber = Number(mathObject[key]);
			if (asNumber && asNumber > 0) {
				passCount++;
				objectToReturn[key] = new Decimal(mathObject[key]);
			}
		}
	}
	if(passCount === validThreshold) {
		isValid = true;
	}
	if (isValid) {
		return objectToReturn;
	} else {
		return false;
	}
}

function removePreloader() {
	let preloaderElement = document.querySelector('.js-rc-preloader');
	if (preloaderElement) {
		preloaderElement.classList.remove('js-active');
		formToActiveIndex(true);
	}
}

function hideAllPanels() {
	for (let i = 0; i < panelElements.length; i++) {
		panelElements[i].classList.remove('js-active');
	}
}

function addInputChangeListener(calculatorElement) {
	if (calculatorElement) {
		calculatorElement.addEventListener('change', onInputChangeAndStepArrival);
		calculatorElement.addEventListener('textInput', onInputChangeAndStepArrival);
		calculatorElement.addEventListener('input', onInputChangeAndStepArrival);
	}
}

function updateTopLabels(ratesSeasonsElement) {
	let serviceTextElement = document.getElementById('js-rc-service-text');
	let seasonTextElement = document.getElementById('js-rc-season-text');
	if (serviceInput) {
		let serviceText = serviceInput.options[serviceInput.selectedIndex].text;
		if (serviceTextElement) {
			serviceTextElement.innerHTML = serviceText;
			if (activePanelIndex === 0) {
				serviceTextElement.classList.add('rate-calculator__top--hide');
			} else {
				serviceTextElement.classList.remove('rate-calculator__top--hide');
			}
		}
	}
	if (ratesSeasonsElement && seasonTextElement) {
		if (ratesSeasonsElement.value === 'off-peak-october-through-may') {
			seasonTextElement.innerHTML = 'Season: Off Peak';
		} else {
			seasonTextElement.innerHTML = 'Season: Peak';
		}
		if (activePanelIndex === 0) {
			seasonTextElement.classList.add('rate-calculator__top--hide');
		} else {
			seasonTextElement.classList.remove('rate-calculator__top--hide');
		}
	}
}

function onInputChangeAndStepArrival() {
	let ratesSeasonsElement = document.getElementById('rates-seasons');
	if (ratesSeasonsElement) {
		updateTopLabels(ratesSeasonsElement);
	}

	let backButton = document.querySelector('.js-rc-btn-back');
	if (backButton) {
		if (activePanelIndex === 0) {
			backButton.parentElement.classList.add('back-parent-hide');
		} else {
			backButton.parentElement.classList.remove('back-parent-hide');
		}
	}

	let footNoteElement = calculatorElement.querySelector('.rate-calculator__footnote');
	if (footNoteElement) {
		if (activePanelIndex === 2) {
			footNoteElement.classList.add('rate-calculator__footnote--hide');
		} else {
			footNoteElement.classList.remove('rate-calculator__footnote--hide');
		}
	}


	let resultElement = calculatorElement.querySelector('.rate-calculator__results');
	if (resultElement) {
		let resultString = returnResultsString(ratesSeasonsElement);
		resultElement.innerHTML = resultString;
	}

	if (activePanelIndex === 0) {
		// Step 1
		if (serviceInput && seasonInput) {
			if (proceedButtons[0]) {
				if (serviceInput.value && seasonInput.value) {
					proceedButtons[0].removeAttribute('disabled');
				} else {
					proceedButtons[0].setAttribute('disabled', true);
				}
				if (serviceInput.value) {
					serviceKey = serviceInput.value;
				} else {
					serviceKey = null;
				}
				toggleStepTwoServices();
			}
		}
	} else if (activePanelIndex === 1) {
		// Step 2
		if (proceedButtons[1]) {
			let cumulativePassing = 0;
			cumulativeEnterFailures = 0;
			let cumulativeInputs = 0;
			let radioCount = 0;
			// validation handler
			for (let i = 0; i < activeStepTwoServices.length; i++) {
				let theseServiceInputs = activeStepTwoServices[i].querySelectorAll('input');
				if (theseServiceInputs.length) {
					cumulativeInputs+= theseServiceInputs.length;
					for (let j = 0; j < theseServiceInputs.length; j++) {
						let inputType = theseServiceInputs[j].getAttribute('type');
						if (inputType === 'radio') {
							radioCount++;
							if (theseServiceInputs[j].checked) {
								cumulativePassing++;
							}
						} else if (theseServiceInputs[j].value) {
							let inputNumber = Number(theseServiceInputs[j].value);
							if (inputNumber >= 0) {
								cumulativePassing++;
								theseServiceInputs[j].setCustomValidity('');
							} else {
								cumulativeEnterFailures++;
								theseServiceInputs[j].setCustomValidity('Enter a positive number or zero.');
							}
						}
					}
				}
			}
			if (radioCount) {
				cumulativeInputs = cumulativeInputs - (radioCount / 2);
			}
			if (cumulativePassing === cumulativeInputs) {
				proceedButtons[1].removeAttribute('disabled');
			} else {
				proceedButtons[1].setAttribute('disabled', true);
			}
		}
	}
}

function returnElementContents(selector, parentElement = null) {
	let stringToReturn = '';
	let element = null;
	if (parentElement) {
		element = parentElement.querySelector(selector);
	} else {
		element = document.querySelector(selector);
	}
	if (element && element.innerHTML) {
		stringToReturn = element.innerHTML.trim();
	}
	return stringToReturn;
}

function addProceedListeners() {
	for (let i = 0; i < proceedButtons.length; i++) {
		proceedButtons[i].addEventListener('click', function() {
			activePanelIndex++;
			formToActiveIndex();
		});
	}
}

function formToActiveIndex(suppressScroll = false) {
	hideAllPanels();
	if (!suppressScroll) {
		scrollToTopForm('.rate-calculator');
	}
	let activePanelElement = panelElements[activePanelIndex];
	if (activePanelElement) {
		activePanelElement.classList.add('js-active');
		onInputChangeAndStepArrival();
	}
}

function toggleStepTwoServices() {
	hideAllServices();
	activeStepTwoServices = [];
	if (calculatorElement && serviceKey) {
		let showClasses = serviceTypeMapping[serviceKey];
		if (showClasses) {
			for (let i = 0; i < showClasses.length; i++) {
				let theseElements = calculatorElement.querySelectorAll('.' + showClasses[i]);
				if (theseElements.length) {
					for (let j = 0; j < theseElements.length; j++) {
						theseElements[j].classList.add('js-rc-selected');
						if (theseElements[j].classList.contains('rate-calculator__service')) {
							activeStepTwoServices.push(theseElements[j]);
						}
					}
				}
			}
		}
		let yesIrrigationElement = document.getElementById('yes-irrigation');
		let irrigationServiceElement = calculatorElement.querySelector('.rate-calculator__service.water-irrigation');
		if (irrigationServiceElement && yesIrrigationElement && yesIrrigationElement.checked) {
			irrigationServiceElement.classList.add('js-rc-selected');
			activeStepTwoServices.push(irrigationServiceElement);
		} else {
			irrigationServiceElement.classList.remove('js-rc-selected');
		}
	}
}

function hideAllServices() {
	for (let i = 0; i < stepTwoServices.length; i++) {
		stepTwoServices[i].classList.remove('js-rc-selected');
	}
}

function decimalToMoneyWithCommas(x, isMoney = true) {
	let thisString;
	if (isMoney) {
		thisString = x.toFixed(2).toString();
	} else {
		thisString = x.toString();
	}
    var parts = thisString.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	if (isMoney) {
    	return '<span class="price">$' + parts.join('.') + '</span>';
	} else {
		return parts.join('.');
	}
}

function scrollToTopForm(querySelectorTarget) {
	let target = document.querySelector(querySelectorTarget);
	let addOffset = -32;
	let elementPosition = target.offsetTop;
	let offsetPosition = elementPosition + addOffset;
	window.scrollTo({
		top: offsetPosition,
		behavior: 'smooth'
	});
}

/**
 * Public API
 *
 * @type {Object}
 */
module.exports = {
	init: init,
};
