const graphql = require('graphql');
const User = require('../mongo-models/User');
const Lesson = require('../mongo-models/Lesson');
const authenticate = require('../authentication');
const bcrypt = require('bcrypt');
const express = require('express');
const app = express();

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
        token: {
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
                return User.findById(args.id);
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                return User.find({});
            }
        },
        lesson: {
            type: UserType,
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
            type: UserType,
            args: {
                username: {
                    type: GraphQLString
                },
                password: {
                    type: GraphQLString
                }
            },
            resolve(parent, args) {
                const user = User.findOne({username: args.username})
                user.token = authenticate.generateToken();
                return user;
            }
        },
        addUser: {
            type: UserType,
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
            resolve(parent, args) {
                let user = new User({
                    name: args.name,
                    username: args.username,
                    email: args.email,
                    hash: bcrypt.hash(args.password, 10),
                    description: args.description
                });
                user.save
                const token = authenticate.generateToken();
                return user;
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});