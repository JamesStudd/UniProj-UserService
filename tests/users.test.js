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

    it('should create a second normal user (userLevel 0)', (done) => {
        request(app)
            .post('/users/register')
            .send({
                username: 'normalUser2',
                email: 'normalUser2@live.co.uk',
                password: 'normalUser2',
                password2: 'normalUser2',
                creditCardNumber: 1111222233334444
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.user).toInclude({
                    username: 'normalUser2',
                    email: 'normalUser2@live.co.uk',
                    creditCardNumber: 1111222233334444
                });
                expect(res.body.token).toExist();
            })
            .end((err, res) => {
                if (err) return done(err);

                User.find({ username: 'normalUser2' }).then((users) => {
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

    it('should create a second staff user (userLevel 1)', (done) => {
        request(app)
            .post('/users/register')
            .send({
                username: 'staffUser2',
                email: 'staffUser2@live.co.uk',
                password: 'staffUser2',
                password2: 'staffUser2',
                creditCardNumber: 1111222233335555,
                userLevel: 1
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.user).toInclude({
                    username: 'staffUser2',
                    email: 'staffUser2@live.co.uk',
                    creditCardNumber: 1111222233335555
                });
                expect(res.body.token).toExist();
            })
            .end((err, res) => {
                if (err) return done(err);

                User.find({ username: 'staffUser2' }).then((users) => {
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

    it('should create a second manager user (userLevel 2)', (done) => {
        request(app)
            .post('/users/register')
            .send({
                username: 'managerUser2',
                email: 'managerUser2@live.co.uk',
                password: 'managerUser2',
                password2: 'managerUser2',
                creditCardNumber: 1111222233335555,
                userLevel: 2
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.user).toInclude({
                    username: 'managerUser2',
                    email: 'managerUser2@live.co.uk',
                    creditCardNumber: 1111222233335555
                });
                expect(res.body.token).toExist();
            })
            .end((err, res) => {
                if (err) return done(err);

                User.find({ username: 'managerUser2' }).then((users) => {
                    expect(users.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            })
    });

    describe('Validation checks', () => {
        describe('Username field', () => {
            it('should fail to create a user, return with an error of \'Username is already in use.\'', (done) => {
                request(app)
                    .post('/users/register')
                    .send({
                        username: 'managerUser',
                        email: 'testing@live.co.uk',
                        password: 'testing',
                        password2: 'testing',
                        creditCardNumber: 1111222233334444
                    })
                    .expect(400)
                    .expect((res) => {
                        expect(res.body[0]).toInclude({
                            msg: 'Username is already in use.'
                        })
                    })
                    .end(done);
            });

            it('should fail to create a user, return with an error of \'Name is a required field.\'', (done) => {
                request(app)
                    .post('/users/register')
                    .send({
                        email: 'testing@live.co.uk',
                        password: 'testing',
                        password2: 'testing',
                        creditCardNumber: 1111222233334444
                    })
                    .expect(400)
                    .expect((res) => {
                        expect(res.body[0]).toInclude({
                            msg: 'Name is a required field.'
                        })
                    })
                    .end(done);
            });
        })

        describe('email field', () => {
            it('should fail to create a user, return with an error of \'Email is a required field.\'', (done) => {
                request(app)
                    .post('/users/register')
                    .send({
                        username: 'different',
                        password: 'testing',
                        password2: 'testing',
                        creditCardNumber: 1111222233334444
                    })
                    .expect(400)
                    .expect((res) => {
                        expect(res.body[0]).toInclude({
                            msg: 'Email is a required field.'
                        })
                    })
                    .end(done);
            });

            it('should fail to create a user, return with an error of \'Invalid email address.\'', (done) => {
                request(app)
                    .post('/users/register')
                    .send({
                        username: 'different',
                        email: '123',
                        password: 'testing',
                        password2: 'testing',
                        creditCardNumber: 1111222233334444
                    })
                    .expect(400)
                    .expect((res) => {
                        expect(res.body[0]).toInclude({
                            msg: 'Invalid email address.'
                        })
                    })
                    .end(done);
            });

            it('should fail to create a user, return with an error of \'Email is already in use.\'', (done) => {
                request(app)
                    .post('/users/register')
                    .send({
                        username: 'different',
                        email: 'managerUser@live.co.uk',
                        password: 'testing',
                        password2: 'testing',
                        creditCardNumber: 1111222233334444
                    })
                    .expect(400)
                    .expect((res) => {
                        expect(res.body[0]).toInclude({
                            msg: 'Email is already in use.'
                        })
                    })
                    .end(done);
            });
        });

        describe('Credit card field', () => {
            it('should fail to create a user, return with an error of \'Credit Card Number is a required field.\'', (done) => {
                request(app)
                    .post('/users/register')
                    .send({
                        username: 'different',
                        email: 'different@live.co.uk',
                        password: 'testing',
                        password2: 'testing'
                    })
                    .expect(400)
                    .expect((res) => {
                        expect(res.body[0]).toInclude({
                            msg: 'Credit Card Number is a required field.'
                        })
                    })
                    .end(done);
            });

            it('should fail to create a user, return with an error of \'Invalid credit card number.\'', (done) => {
                request(app)
                    .post('/users/register')
                    .send({
                        username: 'different',
                        email: 'different@live.co.uk',
                        password: 'testing',
                        password2: 'testing',
                        creditCardNumber: 111
                    })
                    .expect(400)
                    .expect((res) => {
                        expect(res.body[0]).toInclude({
                            msg: 'Invalid credit card number.'
                        })
                    })
                    .end(done);
            });
        });

        describe('Password/Password2 field', () => {
            it('should fail to create a user, return with an error of \'Password is a required field.\'', (done) => {
                request(app)
                    .post('/users/register')
                    .send({
                        username: 'different',
                        email: 'different@live.co.uk',
                        password2: 'testing',
                        creditCardNumber: 1111222233334444
                    })
                    .expect(400)
                    .expect((res) => {
                        expect(res.body[0]).toInclude({
                            msg: 'Password is a required field.'
                        })
                    })
                    .end(done);
            });

            it('should fail to create a user, return with an error of \'Password confirmation is a required field.\'', (done) => {
                request(app)
                    .post('/users/register')
                    .send({
                        username: 'different',
                        email: 'different@live.co.uk',
                        password: 'testing',
                        creditCardNumber: 1111222233334444
                    })
                    .expect(400)
                    .expect((res) => {
                        expect(res.body[0]).toInclude({
                            msg: 'Password confirmation is a required field.'
                        })
                    })
                    .end(done);
            });

            it('should fail to create a user, return with an error of \'Passwords must match.\'', (done) => {
                request(app)
                    .post('/users/register')
                    .send({
                        username: 'different',
                        email: 'different@live.co.uk',
                        password: 'testing1111',
                        password2: 'testing2222',
                        creditCardNumber: 1111222233334444
                    })
                    .expect(400)
                    .expect((res) => {
                        expect(res.body[0]).toInclude({
                            msg: 'Passwords must match.'
                        })
                    })
                    .end(done);
            });
        })
    })
});

describe('GET /users/logout', () => {
    it('should log the user out', (done) => {
        request(app)
            .get('/users/logout')
            .expect(200)
            .expect((res) => {
                expect(res.body).toInclude({
                    "auth": false,
                    "token": null
                })
            })
            .end(done);
    })
});

describe('/users/me | validate Middleware', () => {
    describe('GET', () => {
        it('should return normalUser', (done) => {
            request(app)
                .get('/users/me')
                .set('x-access-token', tokens.normal)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toInclude({
                        "username": 'normalUser',
                        "email": 'normalUser@live.co.uk',
                        "creditCardNumber": 1111222233334444
                    })
                })
                .end(done);
        });

        it('should return a 403 and \'No token provided\'', (done) => {
            request(app)
                .get('/users/me')
                .expect(403)
                .expect((res) => {
                    expect(res.body).toInclude({
                        auth: false, 
                        message: 'No token provided.'
                    })
                })
                .end(done);
        });
    });

    describe('POST', () => {
        it('should change normalUser\'s email address', (done) => {
            request(app)
                .post('/users/me')
                .set('x-access-token', tokens.normal)
                .send({
                    email: 'newNormalUser@live.co.uk',
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toInclude({
                        "username": 'normalUser',
                        "email": 'newNormalUser@live.co.uk',
                        "creditCardNumber": 1111222233334444
                    })
                })
                .end(done);
        });

        it('should change normalUser\'s credit card number', (done) => {
            request(app)
                .post('/users/me')
                .set('x-access-token', tokens.normal)
                .send({
                    creditCardNumber: 1234567890123456,
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toInclude({
                        "username": 'normalUser',
                        "email": 'newNormalUser@live.co.uk',
                        "creditCardNumber": 1234567890123456
                    })
                })
                .end(done);
        });

        it('should change normalUser\'s credit card number and email', (done) => {
            request(app)
                .post('/users/me')
                .set('x-access-token', tokens.normal)
                .send({
                    creditCardNumber: 1010202030304040,
                    email: "evenNewerNormalUser@live.co.uk"
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toInclude({
                        "username": 'normalUser',
                        "email": 'evenNewerNormalUser@live.co.uk',
                        "creditCardNumber": 1010202030304040
                    })
                })
                .end(done);
        });

        it('should not change any of normalUser\'s details', (done) => {
            request(app)
                .post('/users/me')
                .set('x-access-token', tokens.normal)
                .send({
                    creditCardNumber: 123,
                    email: "123"
                })
                .expect(200)
                .expect((res) => {
                    expect(res.body).toInclude({
                        "username": 'normalUser',
                        "email": 'evenNewerNormalUser@live.co.uk',
                        "creditCardNumber": 1010202030304040
                    })
                })
                .end(done);
        })

        it('should not change of normalUser\'s details due to auth failure', (done) => {
            request(app)
                .post('/users/me')
                .send({
                    creditCardNumber: 123,
                    email: "123"
                })
                .expect(403)
                .expect((res) => {
                    expect(res.body).toInclude({
                        auth: false, 
                        message: 'No token provided.'
                    })
                })
                .end(done);
        });
    })
})

describe('GET /users/singleUser/:username', () => {
    it('should return the details for normalUser', (done) => {
        request(app)
            .get('/users/singleUser/normalUser')
            .set('x-access-token', tokens.manager)
            .expect(200)
            .expect((res) => {
                expect(res.body).toInclude({
                    "username": 'normalUser',
                    "email": 'evenNewerNormalUser@live.co.uk'
                })
            })
            .end(done);
    })
})
