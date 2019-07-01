const Casino = require('../models/Casino');
const User = require('../models/User');
const GameMachine = require('../models/GameMachine');
const moneyValidator = require('../validators/moneyValidator');
const errorHandler = require('../utils/errorHandler');


module.exports.addPage = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    res.render('templateForm', {message: "", title: 'Create game machine', action: 'add', user: user});
};

module.exports.add = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    if (!moneyValidator.checkForRightNumber(req.body.number)) { // error in money
        res.render('templateForm', {message: 'Put on correct amount of money', title: 'Create game machine', action: 'add', user: user});
    } else {
        const casino = await Casino.findOne({name: req.params.casinoName});
        const gameMachine = new GameMachine({
            number: req.body.number,
            casino: casino
        });

        try {
            await User.update({name : user.name}, {$set: {money : user.money-req.body.number}});
            await gameMachine.save();
            res.redirect(`http://localhost:5000/api/user/${user.name}/casino/${casino.name}/`);
        } catch (error) {
            errorHandler(res, error)
        }
    }
};

module.exports.getOne = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const casino = await Casino.findOne({name: req.params.casinoName});
    const gameMachine = await GameMachine.findOne({_id: req.params.gmId});
    // console.log(gameMachine);
    res.render('gameMachine', {errorMessage: "", message: "", title: gameMachine.id, user: user, casino: casino, gameMachine: gameMachine});
};

module.exports.pickUpMoney = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const casino = await Casino.findOne({name: req.params.casinoName});
    const gameMachine = await GameMachine.findOne({_id: req.params.gmId});
    const neededAmount = req.body.number;
    if (!moneyValidator.checkForRightNumber(neededAmount) || gameMachine.number < neededAmount) { // errors
        const errorMessage = (!moneyValidator.checkForRightNumber(neededAmount)) ? "Put on correct amount of money" : "Needed more money than it is";
        res.render('gameMachine', {
            errorMessage: errorMessage,
            message: "",
            title: gameMachine.id,
            user: user,
            casino: casino,
            gameMachine: gameMachine});
    } else {
        try {
            await GameMachine.update({_id : gameMachine.id}, {$set: {number : gameMachine.number-neededAmount}});
            await User.update({name : user.name}, {$set: {money : Number(user.money)+Number(neededAmount)}});
            res.render('gameMachine', {
                errorMessage: "",
                message: "Operation success",
                title: gameMachine.id,
                user: user,
                casino: casino,
                gameMachine: gameMachine});
        } catch (error) {
            errorHandler(res, error)
        }
    }
};

module.exports.putMoney = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const casino = await Casino.findOne({name: req.params.casinoName});
    const gameMachine = await GameMachine.findOne({_id: req.params.gmId});
    const number = req.body.number;
    if (!moneyValidator.checkForRightNumber(number) || user.money < number) { // errors
        const errorMessage = (!moneyValidator.checkForRightNumber(number)) ? "Put on correct amount of money" : "You don`t have such money";
        res.render('gameMachine', {
            errorMessage: errorMessage,
            message: "",
            title: gameMachine.id,
            user: user,
            casino: casino,
            gameMachine: gameMachine});
    } else {
        try {
            await GameMachine.update({_id : gameMachine.id}, {$set: {number : Number(gameMachine.number)+Number(number)}});
            await User.update({name : user.name}, {$set: {money : user.money-number}});
            user.money -= number;
            res.render('gameMachine', {
                errorMessage: "",
                message: "Operation success",
                title: gameMachine.id,
                user: user,
                casino: casino,
                gameMachine: gameMachine});
        } catch (error) {
            errorHandler(res, error)
        }
    }
};

module.exports.countMoney = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const casino = await Casino.findOne({name: req.params.casinoName});
    const gameMachine = await GameMachine.findOne({_id: req.params.gmId});
    res.render('gameMachine', {
        errorMessage: "",
        message: `Money in Game Machine - ${Math.floor(gameMachine.number)}`,
        title: gameMachine.id,
        user: user,
        casino: casino,
        gameMachine: gameMachine
    });
};

module.exports.remove = async (req, res) => {
    const gameMachine = await GameMachine.findOne({_id: req.params.gmId});
    if (gameMachine){
        const number = gameMachine.number;
        const casino = await Casino.findOne({name: req.params.casinoName});
        console.log(number);
        try {
            await gameMachine.delete();
            const gameMachines = await GameMachine.find({casino: casino});
            await gameMachines.forEach(async (item) => {
                await GameMachine.update({_id: item._id}, {$set: {number: Number(item.number) + Number(number / gameMachines.length)}});
            });
            res.redirect(`http://localhost:5000/api/user/${req.params.name}/casino/${req.params.casinoName}/`);
        } catch (error) {
            errorHandler(res, error)
        }
    }
};

module.exports.play = async (req, res) => {
    const user = await User.findOne({name: req.params.name});
    const casino = await Casino.findOne({name: req.params.casinoName});
    const gameMachine = await GameMachine.findOne({_id: req.params.gmId});
    const number = req.body.number;
    if (!moneyValidator.checkForRightNumber(number) || gameMachine.number < number*2 || user.money < number) { // errors
        const errorMessage = (!moneyValidator.checkForRightNumber(number)) ? "Put on correct amount of money" :
            (gameMachine.number < number*2) ? "There is no money in game machine" : "You don`t have money";
        res.render('gameMachine', {
            errorMessage: errorMessage,
            message: "",
            title: gameMachine.id,
            user: user,
            casino: casino,
            gameMachine: gameMachine});
    } else { // success
        let randomNumber = Math.floor(Math.random() * 1000).toString();
        randomNumber = randomNumber.split("");
        let gmMoney, userMoney, winStatus;
        if (randomNumber[0] === randomNumber[1] && randomNumber[1] === randomNumber[2]) { // 3
            gmMoney = gameMachine.number - number * 2;
            userMoney = Number(user.money) + Number(number * 2);
            winStatus = 3;
        } else {
            if (randomNumber[0] === randomNumber[1] || randomNumber[0] === randomNumber[2] || randomNumber[1] === randomNumber[2]) { // 2
                console.log("2");
                gmMoney = gameMachine.number - number;
                userMoney = Number(user.money) + Number(number);
                winStatus = 2;
            } else { // 0
                gmMoney = Number(gameMachine.number) + Number(number);
                userMoney = user.money - number;
                winStatus = 0;
            }
        }
        try {
            await GameMachine.update({_id: gameMachine.id}, {$set: {number: gmMoney}});
            await User.update({name: user.name}, {$set: {money: userMoney}});
            user.money = userMoney;
            const message = `Number ${randomNumber.join("")}. ${(winStatus == 0) ? `You lose` : `You win ${number * winStatus}`}`;
            res.render('gameMachine', {
                errorMessage: "",
                message: message,
                title: gameMachine.id,
                user: user,
                casino: casino,
                gameMachine: gameMachine
            });
        } catch (error) {
            errorHandler(res, error)
        }
    }
};