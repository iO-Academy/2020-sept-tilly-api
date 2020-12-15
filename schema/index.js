const graphql = require('graphql');
const User = require('../mongo-models/User');
const Lesson = require('../mongo-models/Lesson');
const authenticate = require('../authentication');
const bcrypt = require('bcrypt');

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
        following: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({
                    _id: {$in : parent.following}
                })
            }
        },
        followers: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({
                    _id: {$in : parent.followers}
                })
            }
        },
        lessons: {
            type: new GraphQLList(LessonType),
            resolve(parent, args) {
                return Lesson.find({
                    _id : {$in : parent.lessons}
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
                return User.findById(args.id);
            }
        },
        username: {
            type: UserType,
            args: {
                username: {
                    type: GraphQLString
                }
            },
            resolve(parent, args) {
                return User.findOne({username: args.username})
            }
        },
        email: {
            type: UserType,
            args: {
                email: {
                    type: GraphQLString
                }
            },
            resolve(parent, args) {
                return User.findOne({email: args.email})
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
            }
        },
        lesson: {
            type: LessonType,
            args: {
                id: {
                    type: GraphQLID
                }
            },
            resolve(parent, args) {
                return Lesson.findById(args.id);
            }
        },
        lessons: {
            type: new GraphQLList(LessonType),
            resolve(parent, args) {
                return Lesson.find({});
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        login: {
            type: GraphQLString,
            args: {
                username: {
                    type: GraphQLString
                },
                password: {
                    type: GraphQLString
                }
            },
            async resolve(parent, args) {
                let user = await User.findOne({username: args.username})
                let result = await bcrypt.compare(args.password, user.hash)
                if (result) {
                    return authenticate.generateToken({id: user.id});
                } else {
                    return 'Login failed'
                }
            }
        },
        addUser: {
            type: GraphQLString,
            args: {
                name: {
                    type: GraphQLString
                },
                username: {
                    type: GraphQLString
                },
                email: {
                    type: GraphQLString
                },
                password: {
                    type: GraphQLString
                },
                description: {
                    type: GraphQLString
                }
            },
            async resolve(parent, args) {
                let user = new User({
                    name: args.name,
                    username: args.username,
                    email: args.email,
                    hash: await bcrypt.hash(args.password, 10),
                    description: args.description,
                });
                user.save();
                return authenticate.generateToken({id: user.id})
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});