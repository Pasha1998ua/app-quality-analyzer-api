function rNum(num) {
    return Math.round(num * 1000) / 1000;
}

function isMatrixValid(matrix) {
    if(matrix && Array.isArray(matrix) && Array.isArray(matrix[0])) {
        let rowControlLength = matrix[0].length;
        for(let i = 0; i < matrix.length; i++) {
            if(rowControlLength !== matrix[i].length) {
                return false;
            }
            for(let j = 0; j < matrix[0].length; j++) {
                if(typeof matrix[i][j] !== 'number'){
                    return false;
                }
            }
        }
        return true;
    } else {
        return false;
    }
}

function getTMatrix(rMatrix, sMatrix) {
    let rowsA = rMatrix.length, colsA = rMatrix[0].length,
        rowsB = sMatrix.length, colsB = sMatrix[0].length,
        tMatrix = [];

    //Number rows and columns error
    if (colsA !== rowsB) return false;

    //Prepare final array
    for (let i = 0; i < rowsA; i++) {
        tMatrix[i] = [];
    }

    //Get T matrix
    for (let k = 0; k < colsB; k++) {
        for (let i = 0; i < rowsA; i++) {
            let multiplicationValue = 0;
            let controlRowSum = 0;
            for (let j = 0; j < rowsB; j++) {
                controlRowSum += rMatrix[i][j];
                multiplicationValue += rMatrix[i][j] * sMatrix[j][k];
            }
            tMatrix[i][k] = rNum(rNum(multiplicationValue) / rNum(controlRowSum));
        }
    }
    return tMatrix;
}

function getWMatrix(tMatrix) {
    let wMatrix = [];
    for (let tMatrixRow of tMatrix) {
        let wMatrixRow = [];
        for (let i = 0; i < tMatrixRow.length; i++) {
            for (let j = i + 1; j < tMatrixRow.length; j++) {
                wMatrixRow.push(Math.min(tMatrixRow[i], tMatrixRow[j]));
            }
        }
        wMatrix.push(wMatrixRow);
    }
    return wMatrix;
}

function getMaxValues(wMatrix) {
    let maxValuesArr = []
    for (let i = 0; i < wMatrix[0].length; i++) {
        let tempArr = []
        for (let j = 0; j < wMatrix.length; j++) {
            tempArr.push(wMatrix[j][i]);
        }
        maxValuesArr.push(Math.max(...tempArr));
    }
    return maxValuesArr;
}

function getMinBoundaryValue(tMatrix, maxValues) {
    let minMaxValues = Math.min(...maxValues);
    let tempArr = [];
    for (let tMatrixRow of tMatrix) {
        tempArr = [...tempArr, ...tMatrixRow];
    }
    let minBoundaryValue = Math.max(...tempArr.filter(el => el < minMaxValues));
    return minBoundaryValue;
}

function getDistribution(tMatrix, minBoundaryValue) {
    let distribution = []
    for (let i = 0; i < tMatrix[0].length; i++) {
        let distributionRow = []
        for (let j = 0; j < tMatrix.length; j++) {
            if (tMatrix[j][i] >= minBoundaryValue) {
                distributionRow.push(j + 1);
            }
        }
        distribution.push(distributionRow);
    }
    return distribution;
}

function calculateParams(rMatrix, sMatrix) {
    if(!isMatrixValid(rMatrix)) {
        return "rMatrix not a matrix or not valid (contain NaN values)";
    }
    if(!isMatrixValid(sMatrix)) {
        return "sMatrix not a matrix or not valid (contain NaN values)";
    }
    if(rMatrix[0].length !== sMatrix.length) {
        return "rMatrix not compatible with sMatrix";
    }
    

    let result = {};
    result.rMatrix = rMatrix;
    result.sMatrix = sMatrix;

    result.tMatrix = getTMatrix(rMatrix, sMatrix);

    result.wMatrix = getWMatrix(result.tMatrix);

    result.maxValues = getMaxValues(result.wMatrix);

    result.minBoundaryValue = getMinBoundaryValue(result.tMatrix, result.maxValues);

    result.distribution = getDistribution(result.tMatrix, result.minBoundaryValue);

    return result;
}

module.exports.calculateParams = calculateParams;