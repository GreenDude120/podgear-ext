const fs = require('fs');
const path = require('path');
const { classes } = require('./const');
/**
 * 
 * @param {String} key this is the item, skill, etc name
 * @returns {String} path to image, if image cannot be found returns null
 */
function getImagePath(key){
    try{
        let fileName = trimName(key);
        let itemPath = path.resolve(`${__dirname}/../img/items/${fileName}.gif`);
        let defaultPath = path.resolve(`${__dirname}/../img/default/${fileName}.png`);
        let basePath = path.resolve(`${__dirname}/../img/${fileName}.png`);
        let runePath = path.resolve(`${__dirname}/../img/runes/${fileName}.png`);
        if(fileExists(basePath)){
            return basePath
        }else if(fileExists(defaultPath)){
            return defaultPath;
        }else if(fileExists(itemPath)){
            return itemPath;
        }else if(fileExists(runePath)){
            return runePath
        }else{
            for(let cls of classes){
                let classPath = path.resolve(`${__dirname}/../img/skills/${cls}/${fileName}.png`)
                if(fileExists(classPath)){
                    return classPath
                }
            }
            return null;
        }

    }catch(err){
        console.log(err);
        return null;
    }

}

function fileExists(filePath){
    let absPath = path.resolve(filePath)
    return fs.existsSync(absPath)
}

function trimName(name){
    return name.toLowerCase().replace(/ /g,"_")
}
module.exports = {
    getImagePath, classes
}

