const { Thought, User } = require('../models');

const thoughtController = {
    getAllThoughts(req,res){
        Thought.find({})
        .select('-__v')
        .sort({_id: -1})
        .then(dbThoughtData => res.json(dbThoughtData))
        .catch(err => {
            console.log(err)
            res.status(400).json(err);
        });
    },
    getThoughtById({params}, res){
        Thought.findOne({_id: params.id})
        .select('-__v')
        .then(dbThoughtData => {
            if(!dbThoughtData){
                res.status(404).json({message: "Cannot find a thought with that id"});
                return
            }
            res.json(dbThoughtData)
        })
        .catch(err=>{
            console.log(err)
            res.status(400).json(err);
        })
    },
    createThought({body},res){
        Thought.create(body)
        .then(({_id}) => {
            return User.findOneAndUpdate(
                {_id: body.userId},
                {$push: { thoughts: _id}},
                {new: true}
            );
        })
        .then(dbUserData => {
            if(!dbUserData){
                res.status(404).json({message: 'Cannot find a user with that id'});
                return
            }
            res.json(dbUserData)
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err);
        })
    },
    updateThought({body}, res){
        Thought.findOneAndUpdate({_id: params.id}, body, {new:true})
        .then(dbThoughtData => {
            if(!dbThoughtData){
                res.status(404).json({message: "No thought was found with that id"});
                return
            }
            res.json(dbThoughtData)
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err);
        })
    },
    deleteThought({params}, res){
        Thought.findOneAndDelete({_id: params.id})
        .then(deletedThought => {
            if(!deletedThought){
            res.status(404).json({message:"No thought was found with that id"});
            return
          }
            return User.findByIdAndUpdate(
                {username: deletedThought.username},
                {$push: { thoughts: params.id}},
                {new: true}
            );
        })
        .then(dbUserData=>{
            if(!dbUserData) {
                res.status(404).json({message: "No thought was found with that id"});
                return
            }
            res.json(dbUserData)
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        })
    },

    //Start Reactions
    addReaction({params,body}, res) {
        Thought.findOneAndUpdate(
            {_id:params.thoughtId },
            {$push: {reactions: body}},
            {new: true, runValidators: true},
        )
        .then(dbThoughtData => {
            if(!dbThoughtData){
                res.status(404).json({message:"No thought was found with that id"});
                return
            }
            res.json(dbThoughtData)
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err)
        })
    },
    deleteReaction({params}, res){
        Thought.findOneAndUpdate(
            {_id: params.thoughtId },
            { $pull: {reactions: {reactionId: params.reactionId}}},
            {new: true}
        )
        .then(dbThoughtData => res.json(dbThoughtData))
        .catch(err => res.json(err));
    }

};

module.exports = thoughtController;