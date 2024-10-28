const {getSlotbydata_id,leaveSlot,leavescheduleSlot} = require('../service/slot.service');

const getSlotbydata_idController = async (req,res) => {
    try {
        const {data_id,semester_id} = req.params;
        // console.log(data_id+""+semester_id);
        const result = await getSlotbydata_id(data_id,semester_id);
        
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const leaveSlotController = async (req,res) => {
    try {
        const {data_id,semester_id,start_date,end_date} = req.params;
        const result = await leaveSlot(data_id,semester_id,start_date,end_date);
        
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

const leavescheduleSlotController = async (req,res) => {
    try {
        const {data_id,semester_id,start_date,end_date} = req.params;
        const result = await leavescheduleSlot(data_id,semester_id,start_date,end_date);
        
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error)
    }
}

module.exports = {getSlotbydata_idController,leaveSlotController,leavescheduleSlotController}