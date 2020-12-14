const graphql = require('graphql');

const User = require('../mongo-models/User');
const Lesson = require('../mongo-models/Lesson');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLBoolean,
    GraphQLSchema,
    GraphQLID,
    GraphQLFloat,
    GraphQLList,
    GraphQLNonNull
} = graphql;


const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {
            type: GraphQLID
        },
        username: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },
        email: {
            type: GraphQLString
        },
        hash: {
            type: GraphQLString
        },
        description: {
            type: GraphQLString
        },
        followingList: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({
                    id: {$in : parent.following}
                })
            }
        },
        followersList: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({
                    id: {$in : parent.followers}
                })
            }
        },
        lessonsList: {
            type: new GraphQLList(LessonType),
            resolve(parent, args) {
                return Lesson.find({
                    id: {$in : parent.lessons}
                })
            }
        }
    })
});

const LessonType = new GraphQLObjectType({
    name: 'Lesson',
    fields: () => ({
        id: {
            type: GraphQLID
        },
        lesson: {
            type: GraphQLString
        },
        user: {
            type: UserType,
            resolve(parent, args) {
                return User.findById(parent.userId)
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        user: {
            type: UserType,
            args: {
                id: {
                    type: GraphQLID
                }
            },
            resolve(parent, args) {
                return User.findById(args._id);
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                description: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                email: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                hash: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                lessons: {
                    type: new GraphQLList(new GraphQLNonNull(GraphQLString))
                },
                name: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                username: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve(parent, args) {
                let user = new User({
                    description: args.description,
                    email: args.email,
                    hash: args.hash,
                    lessons: args.lessons,
                    name: args.name,
                    username: args.username
                });
                return user.save();
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});