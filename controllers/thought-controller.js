const { User, Thought } = require('../models');

const thoughtController = {
   // Get all thoughts
   getAllThoughts(req, res) {
      Thought.find({})
         // ignores the property __v
         .select('-__v')
         // sorts by newest
         .sort({ _id: -1 })
         .then(dbThoughtData => res.json(dbThoughtData))
         .catch(err => {
            console.log(err);
            res.status(400).json(err);
         });
   },
   // Get thought by _id
   getThoughtById({ params }, res) {
      Thought.findOne({ _id: params.id })
         // ignores the property __v
         .select('-__v')
         .then(dbThoughtData => {
            if (!dbThoughtData) {
               res.status(404).json({ message: 'No thought found with this id!' });
               return;
            }

            res.json(dbThoughtData)
         })
         .catch(err => {
            console.log(err);
            res.status(400).json(err);
         });
   },
   // Create Thought
   createThought({ body }, res) {
      // creates a thought
      Thought.create(body)
         // takes the _id from the new object
         .then(({ _id }) => {
            // and adds that to the reference of the user that created the post
            // under the thoughts array
            return User.findOneAndUpdate(
               { _id: body.userId },
               { $push: { thoughts: _id } },
               { new: true }
            );
         })
         .then(dbUserData => {
            if (!dbUserData) {
               res.status(404).json({ message: 'No user found with this id!' });
               return;
            }
            res.json(dbUserData);
         })
         .catch(err => res.json(err));
   },
   // update thought
   updateThought({ params, body }, res) {
      Thought.findOneAndUpdate({ _id: params.id }, body, { new: true })
         .then(dbThoughtData => {
            if (!dbThoughtData) {
               res.status(404).json({ message: 'No thought found with this id!' });
               return;
            }

            res.json(dbThoughtData)
         })
         .catch(err => {
            console.log(err);
            res.status(400).json(err);
         });
   },
   // remove thought
   deleteThought({ params }, res) {
      // finds and deletes the thought using the id
      Thought.findOneAndDelete({ _id: params.id })
         .then(deletedThought => {
            if (!deletedThought) {
               return res.status(404).json({ message: 'No thought with this id!' });
            }
            // uses the id of the deleted thought to pull the reference from the user
            return User.findByIdAndUpdate(
               { username: deletedThought.username },
               { $pull: { thoughts: params.id } },
               { new: true }
            );
         })
         .then(dbUserData => {
            if (!dbUserData) {
               res.status(404).json({ message: 'No user with this id!' });
               return;
            }
            res.json(dbUserData);
         })
         .catch(err => res.json(err));
   },
   // Add a reaction
   addReaction({ params, body }, res) {
      // updates the thought by pushing the reaction to the reactions array
      Thought.findOneAndUpdate(
         { _id: params.thoughtId },
         { $push: { reactions: body } },
         { new: true, runValidators: true }
      )
         .then(dbThoughtData => {
            if (!dbThoughtData) {
               res.status(404).json({ message: 'No thought found with this id!' });
               return;
            }

            res.json(dbThoughtData)
         })
         .catch(err => {
            console.log(err);
            res.status(400).json(err);
         });
   },
   // Removes a reaction
   deleteReaction({ params }, res) {
      // updates the thought by pulling the element from the reactions array
      Thought.findOneAndUpdate(
         { _id: params.thoughtId },
         { $pull: { reactions: { reactionId: params.reactionId } } },
         { new: true }
      )
         .then(dbThoughtData => res.json(dbThoughtData))
         .catch(err => res.json(err));
   }
};

module.exports = thoughtController;