const path = require('path')
const fsPromises = require('fs/promises')

module.exports = {
    logActions: function(message){
        const pathName = path.join('./logs/logs.txt')
        
        fsPromises.appendFile(pathName, `${message} --${new Date()} \n`, {
            encoding: 'utf8'
        })
    }
}