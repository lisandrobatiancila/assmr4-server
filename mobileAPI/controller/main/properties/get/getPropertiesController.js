const { MobileAssumrs } = require('../../../../../model/DMMobileModel')
const logs = require('../../../../../webAPI/middleware/logs/logs')

const mobileAssmrDB = new MobileAssumrs()

const vehicleProperties = (req, res) => {

    mobileAssmrDB.retrieveVehiclesForAssumption()
        .then(response => {
            res.json(response)
        })
        .catch(err => console.log(err))
}

const jewelryProperties = (req, res) => {
    mobileAssmrDB.retrieveJewelriesForAssumption()
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            console.log(err)
        })
}

const getCertainProperty = (req, res) => {
    const { propertyType, propertyID } = req.params
    switch(propertyType){
        case 'vehicle':
            mobileAssmrDB.getCertainVehicle(propertyID)
                .then(response => {
                    res.json(response)
                })
                .catch(err => console.log(err))
        break;
        case 'realestate':
        break;
        case 'jewelry':
            mobileAssmrDB.getCertainJewelry(propertyID)
                .then(response => {
                    res.json(response)
                })
                .catch(err => {
                    res.json(err)
                })
        break;
        default:
            console.log('no certain propertyType')
            logs.logActions(`no certain propertyType -- mobileAPI -- getCertainProperty function`)
    }
}

module.exports = { vehicleProperties, jewelryProperties, getCertainProperty }