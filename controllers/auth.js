const bcrypt = require('bcryptjs');
const User = require('../models/User');
const moneyValidator = require('../validators/moneyValidator');
const errorHandler = require('../utils/errorHandler');


module.exports.getLoginPage = (req, res) => {
    res.render('login', {message: '', title: 'Login'});
}

module.exports.getRegisterPage = (req, res) => {
    res.render('register', {message: '', title: 'Register'});
}

module.exports.login = async (req, res) => {
    const candidate = await User.findOne({name: req.body.name});

    if (candidate){
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password);
        if (passwordResult){
            res.redirect(`http://localhost:5000/api/user/${candidate.name}/casino/all`);
        } else {
            //error
            res.render('login', {message: 'Wrong password', title: 'Login'});
        }
    } else {
        //error
        res.render('login', {message: 'User not found', title: 'Login'});
    }
}

module.exports.register = async (req, res) => {
    const candidate = await User.findOne({name: req.body.name});
    if (!moneyValidator.checkForRightNumber(req.body.amountOfMoney)){
        // error in money
        res.render('register', {message: 'Put on correct amount of money', title: 'Register'});
    } else{
        if (candidate) {
            // error in name of user
            res.render('register', {message: 'Such name already exists. Try another one', title: 'Register'});
        } else {
            const salt = bcrypt.genSaltSync(10);
            const password = req.body.password;
            const user = new User({
                name: req.body.name,
                password: bcrypt.hashSync(password, salt),
                money: req.body.amountOfMoney,
                role: req.body.role
            });

            try {
                await user.save();
                res.redirect('http://localhost:5000/api/auth/login');
            } catch (error) {
                errorHandler(res, error)
            }
        }
    }
};