const Events = require("../models/Event");

const getEvents = async (req, res) => {
  try {
    const filters = {};
    if (req.query.category) {
      filters.category = req.query.category;
    }
    if (req.query.search) {
      filters.title = { $regex: req.query.search, $options: "i" };
    }
    const events = await Events.find(filters).populate(
      "createdBy",
      "name Email",
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getEventsById = async (req, res) => {
  try {
    if (!require("mongoose").isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Events.findById(req.params.id).populate(
      "createdBy",
      "name email",
    );
    if (!event) return res.status(404).json({ message: "Event not found" });

    return res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createEvents = async (req, res) => {
  try {
    const { title, description, descriptions, date, locations, location, category, totalSeats, ticketPrice,image} =
      req.body;
      const event = await Events.create({
        title,
        description: description || descriptions,
        date,
        locations: locations || location,
        category,
        totalSeats,
        availableSeats:totalSeats,
        ticketPrice: ticketPrice || 0,
        image : image || '',
        createdBy : req.user.id
      })
      res.status(201).json(event)
  } catch (error) {
    const status = error.name === "ValidationError" ? 400 : 500;
    res.status(status).json({ message: error.message, error: error.message })
  }
};


const updateEvents = async(req,res)=>{
    try{
        const event = await Events.findByIdAndUpdate(req.params.id , req.body,{new:true})

        if(!event){
          return  res.status(404).json({message:'Event not found'})
        }
        res.json(event)
    }
    catch(error){
        res.status(500).json({message:'Server Error',error:error.message})
    }
}

const deleteEvents = async(req,res)=>{
    try{
        const event = await Events.findByIdAndDelete(req.params.id)
        if(!event){
            return res.status(404).json({message:'Event not found'})
        }
        res.json(event)
    }
    catch(error){
        res.status(500).json({message:'Server Error',error:error.message})
    }
}
module.exports = { getEvents, getEventsById ,createEvents ,updateEvents,deleteEvents};
