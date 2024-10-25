// Generates a table from a JSON file, data.json, of scorigami scores
// Notes:
// * If duplicate scores are present, only the *last* score that appears in
//   the list is used (sort the list by date if you want this to be the earliest
//   game to have that score, either manually or using JS, though you will need
//   to be sure to have a standard date format in that case)
// * Table is only spans from the minimum to maximum score present in the data

TABLE_ID = "scorigami-table"


function isInt(value) {
	return !isNaN(value)
		&& parseInt(Number(value)) == value
		&& !isNaN(parseInt(value, 10));
}

function getTableEntryId(rowId, columnId) {
	return TABLE_ID + "_" + rowId + "_" + columnId;
}

function getScores(games) {
	let scores = [];
	let maxLoss = 0;
	for (const value of Object.values(games)) {
		let s1 = value["NCSU Score"];
		let s2 = value["Opp Score"];
		if (isInt(s1) && isInt(s2)) {
			scores.push(s1);
			scores.push(s2);
			let loserScore = Math.min(s1, s2);
			maxLoss = Math.max(maxLoss, loserScore);
		}
	}
	return [scores, maxLoss];
}

function addRowEntry(row, text, type, id) {
	let elem = document.createElement(type);
	elem.id = id
	let textNode = document.createTextNode(text);
	elem.appendChild(textNode);
	row.appendChild(elem);
}

function createRow(table, data, header, rowId, isHeader=false) {
	let row = table.insertRow();
	for (const i in data) {
		let d = data[i];
		let h = header[i];
		let id = getTableEntryId(rowId, h);
		addRowEntry(row, d, "th", id);
	}
}

function createEmptyTable(table, scores, maxLoss) {
	let minScore = Math.min(...scores);
	let maxScore = Math.max(...scores);	

	let headerData = [""]; // Starts with empty data for left score column
	for (let score = minScore; score <= maxScore; score++) {
		headerData.push(score);
	}

	// Creates headers
	createRow(table, headerData, headerData, "header", true);

	// Creates rows
	for (let score = minScore; score <= maxLoss; score++) {
		let rowData = [score]; // Starts with score column
		for (let col = minScore; col <= maxScore; col++) {
			rowData.push("");
		}
		createRow(table, rowData, headerData, score);
	}
}

function checkPairs(row, col, impossibleScores) {
	for (let a = 0; a < impossibleScores.length; a++) {
		if (row === impossibleScores[a][0]) {
			if (col === impossibleScores[a][1]) {
				return true;
			}
		}
	}
	return false;
}

function getCellClass(row, col) {
	let bottomHalf = col < row;
	let impossibleScores = [ [0,1], [1,1], [1,2], [1,3], [1,4], [1,5], [1,7] ];
	let impossibleScore = checkPairs(row, col, impossibleScores);
	let noLongerPossibleScore = row === col;
	if (bottomHalf) {
		return "black";
	}
	else if (impossibleScore) {
		return "black";
	}
	else if (noLongerPossibleScore) {
		return "orange";
	}
	else {
		return "white";
	}
}

function setDefaultColors(table, scores, maxLoss) {
	let minScore = Math.min(...scores);
	maxScore = Math.max(...scores);
	size = eval((maxScore + 1)*(maxLoss+1)-1);
	for (let row = minScore; row <= maxLoss; row++) {
		for (let col = minScore; col <= maxScore; col++) {
			let id = getTableEntryId(row, col);
			let elem = document.getElementById(id);
			elem.classList.add(getCellClass(row, col));
		}
	}
}

function populateTable(table, games) {
	const arr = Array(size).fill(0);
	for (const value of Object.values(games)) {
		// Skips over non-numbers
		if (!isInt(value["NCSU Score"]) || !isInt(value["Opp Score"])) {
			continue;
		}
		let row = Math.min(value["NCSU Score"], value["Opp Score"]);
		let col = Math.max(value["NCSU Score"], value["Opp Score"]);
		let id = getTableEntryId(row, col);
		let loc = eval(row*(maxScore+1) + col);
		let elem = document.getElementById(id);
		arr[loc]++
		let num = eval(arr[loc]);
		elem.classList = ["green"];
		elem.innerHTML = eval(num);
	}
}

function getGames(table, games, maxScore, maxLoss) {
	let matrix = [];
	for(let i=0; i<maxScore; i++) {
		matrix[i] = [];
		for(let j=0; j<maxLoss; j++) {
			matrix[i][j] = undefined;
		}
	}
	for (const value of Object.values(games)) {
		// Skips over non-numbers
		if (!isInt(value["NCSU Score"]) || !isInt(value["Opp Score"])) {
			continue;
		}
		let row = Math.min(value["NCSU Score"], value["Opp Score"]);
		let col = Math.max(value["NCSU Score"], value["Opp Score"]);
		if (matrix[row][col] === "undefined") {
			let a = 0;
			matrix[row][col][a].push([]);
		}
		else {
			let a = matrix[row][col].length;
		}
		matrix[row][col][a].push(col + "-" + row + ": " + value["Date"] + " - vs " + value["Opponent"] + " (" + value["Result"] + ")");
	}
}




function loadJsonCallback(data) {
	let table = document.getElementById("scorigami-table");
	let [scores, maxLoss] = getScores(data["games"]);
	createEmptyTable(table, scores, maxLoss);
	setDefaultColors(table, scores, maxLoss);
	populateTable(table, data["games"]);
}

fetch("https://raw.githubusercontent.com/cwclaib/cwclaib.github.io/refs/heads/master/football/scorigami/data.json")
	.then((response) => response.json())
	.then((json) => loadJsonCallback(json));

/// https://raw.githubusercontent.com/cwclaib/cwclaib.github.io/refs/heads/master/football/scorigami/data.json
/// data.json