let data;
let order = [];
let backgroundColor = '#0E0F1A';
let textColor = '#F2F2F7';
let mutedColor = '#8A8FA8';

// colore per ogni categoria
let categoryColors = {
  "Musica": '#FF5D73',
  "Sport": '#3DA5FF',
  "Intrattenimento": '#FFC53D',
  "Creator": '#B26BFF',
  "Moda e media": '#2EE6A6',
  "Altro": '#9AA3B5',
};

// margine attorno al grafico e altezza dell'intestazione 
let margin = 30;
let headerHeight = 150;

// interazione col mouse
let hoveredLabel = "";
let hoveredInfo = "";
let hoveredId = null;
let hovered = false;

async function setup() {
  // dimensioni della finestra del browser.
  createCanvas(windowWidth, windowHeight);

  data = await loadTable("instagram_global_influencers_2026.csv", ",", "header");

  // ordinato per follower (dal più alto al più basso).
  for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
    order.push(rowNumber);
  }
  order.sort((a, b) => data.getNum(b, "followers") - data.getNum(a, "followers"));
}

// ridisegna la griglia 
function draw() {
  background(backgroundColor);

  // titolo, sottotitolo e legenda dei colori
  drawHeader();

  // spazio disponibile per la griglia
  let gridWidth = width - 2 * margin;
  let gridHeight = height - headerHeight - margin;

  // numero di colonne
  let numberOfIcons = data.getRowCount();
  let cols = 5;
  let cellSize = 0;
  for (let c = 5; c <= 25; c++) {
    let rows = ceil(numberOfIcons / c);
    let size = min(gridWidth / c, gridHeight / rows);
    if (size > cellSize) {
      cellSize = size;
      cols = c;
    }
  }
  
  let iconSize = min(cellSize * 0.50, 68);

  // allineamento a sinistra
  let startX = margin;

  hovered = false;

  // riga del CSV diventa un'icona nell'ordine dei follower
  for (let i = 0; i < order.length; i++) {
    let rowNumber = order[i];
    let channel = data.getString(rowNumber, "channel_info");
    let country = data.getString(rowNumber, "country");
    let followers = data.getNum(rowNumber, "followers");
    let id = data.getString(rowNumber, "rank");
    let macro = macroCategory(data.getString(rowNumber, "category"));

    // posizione della cella
    let x = startX + (i % cols) * cellSize;
    let y = headerHeight + floor(i / cols) * cellSize;
    let cx = x + cellSize / 2;
    // Centro verticale dell'icona spostato leggermente verso l'alto
    let cy = y + cellSize * 0.35;

    // posizione in classifica 
    let rank = i + 1;

    // se il puntatore dentro questa e memorizza il profilo corrispondente
    let isHovered =
      mouseX >= x && mouseX <= x + cellSize && mouseY >= y && mouseY <= y + cellSize;
    if (isHovered) {
      hoveredLabel = "#" + rank + "  @" + channel;
      hoveredInfo = formatBig(followers) + " follower  ·  " + country;
      hoveredId = id;
      hovered = true;
    }

    // icona piu grande
    drawInstagramIcon(cx, cy, isHovered ? iconSize * 1.15 : iconSize, categoryColors[macro]);

    // testo sotto l'icona su due righe
    noStroke();
    textAlign(CENTER, CENTER);

    // 1. numero di posizione 
    textSize(constrain(cellSize * 0.10, 8, 10));
    fill(mutedColor);
    text("#" + rank, cx, y + cellSize * 0.70);

    // 2. nome Instagram sotto a capo
    textSize(constrain(cellSize * 0.11, 8, 11));
    fill(isHovered ? textColor : '#C9CCDB');
    let label = "@" + channel;
    while (textWidth(label) > cellSize - 4 && label.length > 4) {
      label = label.slice(0, -2) + "…";
    }
    text(label, cx, y + cellSize * 0.88);
  }

  //  nome e follower vicino al puntatore 
  if (hovered) {
    cursor(HAND);
    noStroke();
    fill(255);
    rect(mouseX + 12, mouseY + 12, 190, 46, 8);
    fill(20);
    textAlign(LEFT, TOP);
    textStyle(BOLD);
    textSize(14);
    text(hoveredLabel, mouseX + 22, mouseY + 20);
    textStyle(NORMAL);
    textSize(12);
    text(hoveredInfo, mouseX + 22, mouseY + 38);
  } else {
    cursor(ARROW);
  }
}

// titolo, sottotitolo e legenda
function drawHeader() {
  noStroke();
  textAlign(LEFT, TOP);

  fill(textColor);
  textStyle(BOLD);
  textSize(28);
  text("I 100 profili Instagram più seguiti", margin, 24);
  textStyle(NORMAL);

  fill(mutedColor);
  textSize(13);
  text(
    "Esplora i 100 profili Instagram più seguiti, clicca le icone per vedere i dettagli. ",
    margin,
    62,
    width - 2 * margin
  );

  // legenda
  let x = margin;
  textSize(13);
  for (let name of Object.keys(categoryColors)) {
    drawInstagramIcon(x + 11, 112, 22, categoryColors[name]);
    noStroke();
    fill(textColor);
    textAlign(LEFT, CENTER);
    text(name, x + 28, 112);
    x += 28 + textWidth(name) + 24;
  }
}

// icona Instagram
function drawInstagramIcon(cx, cy, s, hex) {
  noStroke();
  fill(hex);
  rect(cx - s / 2, cy - s / 2, s, s, s * 0.28);

  noFill();
  stroke(255);
  strokeWeight(max(1.5, s * 0.07));
  rect(cx - s * 0.3, cy - s * 0.3, s * 0.6, s * 0.6, s * 0.17);
  circle(cx, cy, s * 0.3);

  noStroke();
  fill(255);
  circle(cx + s * 0.19, cy - s * 0.19, max(2, s * 0.07));
}

// raggruppa
function macroCategory(category) {
  if (category.startsWith("Music")) return "Musica";
  if (category.startsWith("Sport")) return "Sport";
  if (category.startsWith("Content Creator")) return "Creator";
  if (category.startsWith("Entertainment") || category.startsWith("Comedy") || category.startsWith("Food")) {
    return "Intrattenimento";
  }
  if (category.startsWith("Fashion") || category.startsWith("Media") || category.startsWith("Modeling")) {
    return "Moda e media";
  }
  return "Altro";
}

// numero grande in forma breve: 680000000 -> "680 M"
function formatBig(value) {
  if (value >= 1e9) return (value / 1e9).toFixed(1) + " mld";
  return (value / 1e6).toFixed(0) + " M";
}

function mousePressed() {
  if (hovered) {
    // nuovo URL: stessa cartella, pagina detail.html con il parametro id.
    let newURL = "detail.html?id=" + hoveredId;

    console.log(newURL);

    // redirect nella stessa scheda
    window.location.href = newURL;
  }
}
