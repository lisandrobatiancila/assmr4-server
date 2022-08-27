const { Assumrs } = require('../../../../../model/DBModel')
const logs = require('../../../../middleware/logs/logs')

const assumrDB = new Assumrs()

const getRandomProperties = async (req, res) => {
    const { retrieveType } = req.params
    
    switch(retrieveType){
        case 'random':
            var randIndex = Math.round(Math.random()*2) /* this means 0 for vehicles, 1 for realestates, 2 for jewelries*/
            console.log('tests', randIndex)
            res.json(
                randIndex == 0? await assumrDB.retrieveVehiclesForAssumption()
                    : randIndex == 1? await assumrDB.retrieveRealestatesForAssumption()
                    : randIndex == 2? await assumrDB.retrieveJewelriesForAssumption()
                    : {message: `error can't send random properties`}
            )
        break;
        case 'vehicles':
            res.json(await assumrDB.retrieveVehiclesForAssumption())
        break;
        case 'realestates':
            randIndex = Math.round(Math.random(0)*2)
            const realestatesType = ['house', 'house and lot', 'lot']
            
            const realestateRandType = realestatesType[2]
            res.json(await assumrDB.retrieveRealestatesForAssumption(realestateRandType))
        break;
        case 'jewelries':
            res.json(await assumrDB.retrieveJewelriesForAssumption())
        break;
        default:
            console.log('no propertyType')
            logs.logActions(`getController.js 35 no propertyType`)
            res.json({message: 'no propertyType'})
    }
    res.end()
}

const propertyForAssumption = async (req, res) => {
    const { propertyType } = req.params

    switch(propertyType) {
        case "vehicles":
            res.json(await assumrDB.retrieveVehiclesForAssumption())
        break;
        case "realestates":
            const { other_info } = req.params

            res.json(await assumrDB.retrieveRealestatesForAssumption(other_info))
        break;
        case "jewelries":
            res.json(await assumrDB.retrieveJewelriesForAssumption())
        break;
        default:
            console.log("no propertyType")
    }
}

const certainProperties = (req, res) => {
    const { propertyType, propertyID } = req.params
    
    assumrDB.getCertainProperty(propertyType, propertyID)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            logs.logActions(`Err getController.js ${err}`)
            res.json(err)
        })
}

module.exports = { getRandomProperties, certainProperties, propertyForAssumption }