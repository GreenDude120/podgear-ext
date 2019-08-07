const { getImagePath } = require('./helper');
let ItemName = "Sigon's Gage"
let imagePath = getImagePath(ItemName)
console.log(`Image for ${ItemName} can be found at: ${imagePath}`)