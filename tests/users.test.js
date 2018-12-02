const expect = require('expect');
const request = require('supertest');
const validation = require('./../utils/validation');

const {app} = require('../app');
const User = require('./../database/models/userModel');

describe('Validation utils', () => {
    describe('Credit card number validation', () => {
        it('should return true', () => {
            var check = validation.isCreditCardNumber('1111-2222-3333-4444');
            expect(check).toBe(true);
        });

        it('should return true', () => {
            var check = validation.isCreditCardNumber('1111222233334444');
            expect(check).toBe(true);
        });

        it('should return true', () => {
            var check = validation.isCreditCardNumber(1111222233334444);
            expect(check).toBe(true);
        });

        it('should return false', () => {
            var check = validation.isCreditCardNumber('123');
            expect(check).toBe(false);
        });

        it('should return false', () => {
            var check = validation.isCreditCardNumber(123);
            expect(check).toBe(false);
        });
    })

    describe('Email validation', () => {
        it('should return true', () => {
            var check = validation.isEmail('james@live.co.uk');
            expect(check).toBe(true);
        });

        it('should return true', () => {
            var check = validation.isEmail('james@outlook.com');
            expect(check).toBe(true);
        });

        it('should return false', () => {
            var check = validation.isEmail('j.com');
            expect(check).toBe(false);
        });

        it('should return false', () => {
            var check = validation.isEmail(123);
            expect(check).toBe(false);
        });
    })
});

describe('POST /users/register', () => {
    before((done) => {
        User.deleteMany({}).then(() => done());
    })

    it('should create a new user', (done) => {
        request(app)
            .post('/users/register')
            .send({
                username: 'testing', 
                email: 'testing@live.co.uk',
                password: 'testing',
                password2: 'testing',
                creditCardNumber: 1111222233334444
            })
            .expect(200)
            .expect((res) => {
                expect(res.body).toInclude({ 
                    username: 'testing', 
                    email: 'testing@live.co.uk',
                    creditCardNumber: 1111222233334444
                })
            })
            .end((err, res) => {
                if (err) return done(err);
             
                User.find({username: 'testing'}).then((users) => {
                    expect(users.length).toBe(1);
                    done();
                }).catch((e) => done(e));
            })
    });

    it('should create a different user', (done) => {
        request(app)
            .post('/users/register')
            .send({
                username: 'testing2', 
                email: 'testing2@live.co.uk',
                password: 'testing2',
                password2: 'testing2',
                creditCardNumber: 1111222233335555
            })
            .expect(200)
            .expect((res) => {
                expect(res.body).toInclude({ 
                    username: 'testing2', 
                    email: 'testing2@live.co.uk',
                    creditCardNumber: 1111222233335555
                })
            })
            .end((err, res) => {
                if (err) return done(err);
             
                User.find({username: 'testing2'}).then((users) => {
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
                        username: 'testing', 
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
                        email: 'testing@live.co.uk',
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

describe('GET /users/list', () => {
    it('should return 2 users, created in the previous tests', (done) => {
        request(app)
            .get('/users/list')
            .expect(200)
            .expect((res) => {
                var len = res.body.length;
                expect(len).toBe(2);
                expect(res.body[0]).toInclude({
                    username: 'testing',
                    email: 'testing@live.co.uk',
                    creditCardNumber: 1111222233334444
                });
                expect(res.body[1]).toInclude({
                    username: 'testing2',
                    email: 'testing2@live.co.uk',
                    creditCardNumber: 1111222233335555
                });
            })
            .end(done);
    })
})

describe('GET /users/:username', () => {
    it('should return the user with username \'testing\'', (done) => {
        request(app)
            .get('/users/testing')
            .expect(200)
            .expect((res) => {
                expect(res.body).toInclude({
                    username: 'testing',
                    email: 'testing@live.co.uk',
                    creditCardNumber: 1111222233334444
                })
            })
            .end(done);
    });

    it('should return 404, as there is no user with username \'anon\'', (done) => {
        request(app)
            .get('/users/anon')
            .expect(404)
            .end(done);
    })
})
