const expect = require('expect');
const request = require('supertest');

const { app } = require('../server');
const User = require('./../database/models/userModel');

const tokens = {
    normal: '',
    staff: '',
    manager: ''
}

describe('POST /users/register', () => {
    before((done) => {
        User.deleteMany({}).then(() => done());
    })

    it('should create a normal user (userLevel 0)', (done) => {
        request(app)
            .post('/users/register')
            .send({
                username: 'normalUser',
                email: 'normalUser@live.co.uk',
                password: 'normalUser',
                password2: 'normalUser',
                creditCardNumber: 1111222233334444
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.user).toInclude({
                    username: 'normalUser',
                    email: 'normalUser@live.co.uk',
                    creditCardNumber: 1111222233334444
                });
                expect(res.body.token).toExist();
                tokens.normal = res.body.token;
            })
            .end((err, res) => {
                if (err) return done(err);

                User.find({ username: 'normalUser' }).then((users) => {
                    expect(users.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            })
    });

    it('should create a staff user (userLevel 1)', (done) => {
        request(app)
            .post('/users/register')
            .send({
                username: 'staffUser',
                email: 'staffUser@live.co.uk',
                password: 'staffUser',
                password2: 'staffUser',
                creditCardNumber: 1111222233335555,
                userLevel: 1
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.user).toInclude({
                    username: 'staffUser',
                    email: 'staffUser@live.co.uk',
                    creditCardNumber: 1111222233335555
                });
                expect(res.body.token).toExist();
                tokens.staff = res.body.token;
            })
            .end((err, res) => {
                if (err) return done(err);

                User.find({ username: 'staffUser' }).then((users) => {
                    expect(users.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            })
    });

    it('should create a manager user (userLevel 2)', (done) => {
        request(app)
            .post('/users/register')
            .send({
                username: 'managerUser',
                email: 'managerUser@live.co.uk',
                password: 'managerUser',
                password2: 'managerUser',
                creditCardNumber: 1111222233335555,
                userLevel: 2
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.user).toInclude({
                    username: 'managerUser',
                    email: 'managerUser@live.co.uk',
                    creditCardNumber: 1111222233335555
                });
                expect(res.body.token).toExist();
                tokens.manager = res.body.token;
            })
            .end((err, res) => {
                if (err) return done(err);

                User.find({ username: 'managerUser' }).then((users) => {
                    expect(users.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            })
    });
});

describe('GET /users/list | isAdmin Middleware', () => {
    it('should return 3 users, created in the previous tests', (done) => {
        request(app)
            .get('/users/list')
            .set('x-access-token', tokens.manager)
            .expect(200)
            .expect((res) => {
                var len = res.body.length;
                expect(len).toBe(3);
                expect(res.body[0]).toInclude({
                    username: 'normalUser',
                    email: 'normalUser@live.co.uk'
                });
                expect(res.body[1]).toInclude({
                    username: 'staffUser',
                    email: 'staffUser@live.co.uk'
                });
                expect(res.body[2]).toInclude({
                    username: 'managerUser',
                    email: 'managerUser@live.co.uk'
                });
            })
            .end(done);
    });

    it('should fail, and return \'No token provided.\'', (done) => {
        request(app)
            .get('/users/list')
            .expect(403)
            .expect((res) => {
                expect(res.body).toInclude({
                    "auth": false,
                    "message": "No token provided."
                })
            })
            .end(done);
    });

    it('should fail, and return \'Unauthorized to view this content.\'', (done) => {
        request(app)
            .get('/users/list')
            .set('x-access-token', tokens.normal)
            .expect(401)
            .expect((res) => {
                expect(res.body).toInclude({
                    "auth": false,
                    "message": 'Unauthorized to view this content.'
                })
            })
            .end(done);
    })
})

describe('POST /admin/users/:username', () => {
    it('should delete the user with username \'normalUser\'', (done) => {
        request(app)
            .post('/admin/delete/normalUser')
            .set('x-access-token', tokens.manager)
            .expect(200)
            .expect((res) => {
                expect(res.body).toInclude({
                    "status": 'User deleted',
                    "deleted": true,
                    "username": "normalUser"
                })
            })
            .end(done);
    });

    it('should return a 404, as no user found called \'NoUserFound\'', (done) => {
        request(app)
            .post('/admin/delete/NoUserFound')
            .set('x-access-token', tokens.manager)
            .expect(404)
            .end(done);
    });

    it('should return a 404, as no user found called \'normalUser\'', (done) => {
        request(app)
            .post('/admin/delete/NoUserFound')
            .set('x-access-token', tokens.manager)
            .expect(404)
            .end(done);
    });
})

describe('POST /admin/:username', () => {
    it('should return the details for staffUser, after changing their userLevel to 2', (done) => {
        request(app)
            .post('/admin/staffUser')
            .set('x-access-token', tokens.manager)
            .send({
                userLevel: 2
            })
            .expect(200)
            .expect((res) => {
                expect(res.body).toInclude({
                    "username": "staffUser",
                    "email": "staffUser@live.co.uk",
                    "userLevel": 2
                })
            })
            .end(done);
    });

    it('should fail to change the userLevel of staffUser, as it will pass in \'4\'', (done) => {
        request(app)
        .post('/admin/staffUser')
        .set('x-access-token', tokens.manager)
        .send({
            userLevel: 4
        })
        .expect(400)
        .expect((res) => {
            expect(res.body).toInclude({
                "error": "userLevel must be a number that is 0, 1 or 2."
            })
        })
        .end(done);
    })

    it('should fail to change the userLevel of staffUser, as it will pass in \'-1\'', (done) => {
        request(app)
        .post('/admin/staffUser')
        .set('x-access-token', tokens.manager)
        .send({
            userLevel: -1
        })
        .expect(400)
        .expect((res) => {
            expect(res.body).toInclude({
                "error": "userLevel must be a number that is 0, 1 or 2."
            })
        })
        .end(done);
    })

    it('should fail to change the userLevel of staffUser, as it will pass in \'apple\'', (done) => {
        request(app)
        .post('/admin/staffUser')
        .set('x-access-token', tokens.manager)
        .send({
            userLevel: 'apple'
        })
        .expect(400)
        .expect((res) => {
            expect(res.body).toInclude({
                "error": "userLevel must be a number that is 0, 1 or 2."
            })
        })
        .end(done);
    })
});

describe('Get list, delete user, get list, delete user, get list', () => {
    it('should return 2 users', (done) => {
        request(app)
            .get('/users/list')
            .set('x-access-token', tokens.manager)
            .expect(200)
            .expect((res) => {
                var len = res.body.length;
                expect(len).toBe(2);
                expect(res.body[0]).toInclude({
                    username: 'staffUser',
                    email: 'staffUser@live.co.uk'
                });
                expect(res.body[1]).toInclude({
                    username: 'managerUser',
                    email: 'managerUser@live.co.uk'
                });
            })
            .end(done);
    });
    
    it('should delete the user with username \'staffUser\'', (done) => {
        request(app)
            .post('/admin/delete/staffUser')
            .set('x-access-token', tokens.manager)
            .expect(200)
            .expect((res) => {
                expect(res.body).toInclude({
                    "status": 'User deleted',
                    "deleted": true,
                    "username": "staffUser"
                })
            })
            .end(done);
    });

    it('should return 1 user', (done) => {
        request(app)
            .get('/users/list')
            .set('x-access-token', tokens.manager)
            .expect(200)
            .expect((res) => {
                var len = res.body.length;
                expect(len).toBe(1);
                expect(res.body[0]).toInclude({
                    username: 'managerUser',
                    email: 'managerUser@live.co.uk'
                });
            })
            .end(done);
    });

    it('should delete the user with username \'managerUser\'', (done) => {
        request(app)
            .post('/admin/delete/managerUser')
            .set('x-access-token', tokens.manager)
            .expect(200)
            .expect((res) => {
                expect(res.body).toInclude({
                    "status": 'User deleted',
                    "deleted": true,
                    "username": "managerUser"
                })
            })
            .end(done);
    });

    it('should return 404, as there are no users left', (done) => {
        request(app)
            .get('/users/list')
            .set('x-access-token', tokens.manager)
            .expect(404)
            .end(done);
    });
});