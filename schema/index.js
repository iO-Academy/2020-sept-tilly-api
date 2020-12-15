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
        availableUsername: {
            type: GraphQLBoolean,
            args: {
                username: {
                    type: GraphQLString
                }
            },
            async resolve(parent, args) {
                return await User.findOne({username: args.username}) === null;
            }
        },
        availableEmail: {
            type: GraphQLBoolean,
            args: {
                email: {
                    type: GraphQLString
                }
            },
            async resolve(parent, args) {
                if (await User.findOne({email: args.email}) !== null ){
                    return false;
                }
                return true;
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
                    description: args.description
                });
                user.save();
                return authenticate.generateToken({id: user.id})
            }
        },
        addTil: {
            type: LessonType,
            args: {
                lesson: {
                    type: GraphQLString
                },
                userId: {
                    type: GraphQLID
                },
                token: {
                    type: GraphQLString
                }
            },
            async resolve(parent, args) {
                let lesson = new Lesson({
                    lesson: args.lesson,
                    userId: args.userId
                });
                let tokenResponse = await authenticate.authenticateToken(args.token)
                if (tokenResponse && tokenResponse.id === args.userId) {
                    let user = await User.findById(args.userId)
                    user.lessons.push(lesson._id)
                    await User.updateOne({_id: args.userId}, {$set: {lessons: user.lessons}})
                    return lesson.save();
                }
            }
        },
        follow: {
            type: GraphQLBoolean,
            args: {
                follower: {
                    type: GraphQLID
                },
                followee: {
                    type: GraphQLID
                },
                token: {
                    type: GraphQLString
                }
            },
            async resolve(parent, args) {
                let tokenResponse = await authenticate.authenticateToken(args.token)
                if (tokenResponse && tokenResponse.id === args.follower) {
                    let follower = await User.findById(args.follower)
                    let followee = await User.findById(args.followee)
                    follower.following.push(followee._id)
                    followee.followers.push(follower._id)
                    await User.updateOne({_id: args.follower}, {$set: {following: follower.following}})
                    await User.updateOne({_id: args.followee}, {$set: {followers: followee.followers}})
                    return true;
                }
                return false;
            }
        },
        unfollow: {
            type: GraphQLBoolean,
            args: {
                follower: {
                    type: GraphQLID
                },
                followee: {
                    type: GraphQLID
                },
                token: {
                    type: GraphQLString
                }
            },
            async resolve(parent, args) {
                let tokenResponse = await authenticate.authenticateToken(args.token)
                if (tokenResponse && tokenResponse.id === args.follower) {
                    let follower = await User.findById(args.follower)
                    let followee = await User.findById(args.followee)
                    console.log(follower.following)
                    console.log(followee._id)
                    console.log(follower.following.findIndex(
                        val => {
                            val == followee._id
                        }))
                    // follower.following.splice(
                    //     follower.following.findIndex(
                    //         val => {
                    //             val === followee._id
                    //         })
                    //     ,1
                    // )
                    // followee.followers.splice(
                    //     followee.followers.findIndex(
                    //         val => {
                    //             val === follower._id
                    //         })
                    //     ,1
                    // )
                    // await User.updateOne({_id: args.follower}, {$set: {following: follower.following}})
                    // await User.updateOne({_id: args.followee}, {$set: {followers: followee.followers}})
                    // return true;
                }
                return false;
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});