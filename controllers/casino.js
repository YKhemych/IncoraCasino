const Casino = require('../models/Casino');
const User = require('../models/User');
const GameMachine = require('../models/GameMachine');
const moneyValidator = require('../validators/moneyValidator');
const errorHandler = require('../utils/errorHandler');


module.exports.getAll = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const casinos = await Casino.find();
    // console.log(casinos);
    res.render('casinos', {message: "", title: 'Casinos', user: user, casinos: casinos});
};

module.exports.addPage = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    res.render('addCasino', {message: "", title: 'Add casino', user: user});
};

module.exports.add = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const candidate = await Casino.findOne({name: req.body.name});
    if (candidate){ //error
        res.render('addCasino', {message: "Such name already exists. Try another one", title: 'Add casino', user: user});
    } else {
        const casino = new Casino({
            name: req.body.name,
            owner: user
        });
        try {
            await casino.save();
            res.redirect(`http://localhost:5000/api/user/${user.name}/casino/all`);
        } catch (error) {
            errorHandler(res, error)
        }
    }
};

module.exports.getOne = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const casino = await Casino.findOne({name: req.params.casinoName});
    const gameMachines = await GameMachine.find({casino: casino});
    // console.log(gameMachines);
    res.render('casino', {message: "", title: `Casino ${casino.name}`, user: user, casino: casino, gameMachines: gameMachines});
};

module.exports.getNumberOfMachine = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const casino = await Casino.findOne({name: req.params.casinoName});
    const gameMachines = await GameMachine.find({casino: casino});
    res.render('casino', {message: `Number of game machine ${gameMachines.length}`, title: `Casino ${casino.name}`, user: user, casino: casino, gameMachines: gameMachines});
};

module.exports.getAllMoney = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const casino = await Casino.findOne({name: req.params.casinoName});
    const gameMachines = await GameMachine.find({casino: casino});
    let allMoney = 0;
    gameMachines.forEach((item)=>{
        allMoney += item.number;
    });
    res.render('casino', {message: `Amount of money in casino - ${Math.floor(allMoney)}`, title: `Casino ${casino.name}`, user: user, casino: casino, gameMachines: gameMachines});
};

module.exports.pickUpMoneyPage = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    res.render('templateForm', {message: "", title: 'Pick up money from casino', action: 'pickUpMoney', user: user});
};

module.exports.pickUpMoney = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const neededAmount = req.body.number;
    const casino = await Casino.findOne({name: req.params.casinoName});
    const gameMachines = await GameMachine.find({casino: casino}).sort({number: -1});
    let allMoney = 0;
    gameMachines.forEach((item)=>{
        allMoney += item.number;
    });
    if (!moneyValidator.checkForRightNumber(neededAmount) || allMoney < neededAmount) { // errors
        const message = (!moneyValidator.checkForRightNumber(neededAmount)) ? 'Put on correct amount of money' : 'Needed more money than it is';
        res.render('templateForm', { message: message, title: 'Pick up money from casino', action: 'pickUpMoney', user: user});
    } else {
        let number = 0;
        while(neededAmount != number){
            gameMachines.every((item) => {
                if (neededAmount <= item.number/2){
                    number = neededAmount;
                    item.number -= number;
                    return false;
                } else{
                    if (neededAmount-number <= item.number/2) {
                        item.number -= neededAmount - number;
                        number += neededAmount - number;
                        return false;
                    } else{
                        number += item.number/2;
                        item.number -= item.number/2;
                        return true;
                    }
                }
            });
        }
        try {
            await User.update({name : user.name}, {$set: {money : Number(user.money)+Number(number)}});
            await gameMachines.forEach(async (item)=>{
                await GameMachine.update({_id : item._id}, {$set: {number : item.number}});
            });
            res.redirect(`http://localhost:5000/api/user/${user.name}/casino/${casino.name}/`);
        } catch (error) {
            errorHandler(res, error)
        }
    }
};

module.exports.putMoneyPage = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    res.render('templateForm', {message: "", title: 'Put money to casino', action: 'putMoney', user: user});
};

module.exports.putMoney = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const number = req.body.number;
    if (!moneyValidator.checkForRightNumber(number) || user.money < number) { // errors
        const errorMessage = (!moneyValidator.checkForRightNumber(number)) ? 'Put on correct amount of money' : 'You don`t have such money';
        res.render('templateForm', { message: errorMessage, title: 'Put money to casino', action: 'putMoney', user: user});
    } else {
        const casino = await Casino.findOne({name: req.params.casinoName});
        const gameMachines = await GameMachine.find({casino: casino});
        try {
            await User.update({name: user.name}, {$set: {money: user.money - number}});
            await gameMachines.forEach(async (item) => {
                await GameMachine.update({_id: item._id}, {$set: {number: Number(item.number) + Number(number / gameMachines.length)}});
            });
            res.redirect(`http://localhost:5000/api/user/${user.name}/casino/${casino.name}/`);
        } catch (error) {
            errorHandler(res, error)
        }
    }
};