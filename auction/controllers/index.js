const { Op } = require('sequelize');
const { Good, Auction, User, sequelize } = require('../models');
const schedule = require('node-schedule');

exports.renderMain = async (req, res, next) => {
    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); // 어제 시간
        const goods = await Good.findAll({
            where: { SoldId: null, createdAt: { [Op.gte]: yesterday } },
        });
        res.render('main', {
            title: 'NodeAuction',
            goods,
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.renderJoin = (req, res) => {
    res.render('join', {
        title: '회원가입 - NodeAuction',
    });
};

exports.renderGood = (req, res) => {
    res.render('good', { title: '상품 등록 - NodeAuction' });
};

exports.createGood = async (req, res, next) => {
    try {
        const { name, price } = req.body;
        const good = await Good.create({
            OwnerId: req.user.id,
            name,
            img: req.file.filename,
            price,
        });
        // 생성 시간보다 24시간 뒤에가 경매 종료 시간
        //
        const end = new Date();
        end.setDate(end.getDate() + 1); // 하루 뒤
        // scheduleJob(경매 끝나는 시간, 콜백 함수)을 해주면 그 시간에 콜백 함수가 실행됨
        const job = schedule.scheduleJob(end, async () => {
            // 낙찰자를 정해줌 - 제일 높게 입찰한 사람을 찾음!
            // 입찰가로 내림차순으로 정렬했을 때 첫 요소가 제일 높은 입찰가!
            const success = await Auction.findOne({
                where: { GoodId: good.id },
                order: [['bid', 'DESC']],
            });
            // 제일 높은 입찰가에 해당하는 사람에게 낙찰
            await good.setSold(success.UserId);
            // 낙찰됐다면 낙찰가만큼 돈을 줄임
            await User.update({
                // 돈을 줄이는 SQL -> SET money = money - 1000000
                //  - 이 구문을 Sequelize JS로는 표현하기 힘들어 SQL문 그대로 이용할 것임
                //  - sequelize.literal() 이용!
                money: sequelize.literal(`money - ${success.bid}`),
            }, {
                where: { id: success.UserId },
            })
        });
        // job에도 이벤트 리스너가 존재!
        // 스케쥴러가 에러났을 때
        job.on('error', console.error);
        // 스케쥴러가 성공했을 때
        job.on('success', () => {
            console.log(`${good.id} 스케쥴링 성공`);
        })
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.renderAuction = async (req, res, next) => {
    try {
        const [good, auction] = await Promise.all([
            Good.findOne({
                where: { id: req.params.id },
                include: {
                    model: User,
                    as: 'Owner',
                }
            }),
            Auction.findAll({
                where: { GoodId: req.params.id },
                include: { model: User },
                order: [['bid', 'ASC']]
            }),
        ]);
        // const good = await Good.findOne({
        //     where: { id: req.params.id },
        //     include: {
        //         model: User,
        //         as: 'Owner',
        //     }
        // });
        // const auction = await Auction.findAll({
        //     where: { GoodId: req.params.id },
        //     include: { model: User },
        //     order: [['bid', 'ASC']]
        // });
        res.render('auction', {
            title: `${good.name} - NodeAuction`,
            good,
            auction,
        })
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.bid = async (req, res, next) => {
    try {
        // 프론트로부터 입찰 가격과 메시지를 받음
        const { bid, msg } = req.body;
        const good = await Good.findOne({
            where: { id: req.params.id },
            include: { model: Auction },
            // include된 것을 정렬하고 싶다면 아래와 같이 작성해줘야 함!
            //  - include된 것을 정렬하려면 세 가지를 작성!
            order: [[{ model: Auction }, 'bid', 'DESC']]
        })
        // 제약 조건을 검사해줘야 함
        //  - ex. 이전 입찰자보다 항상 더 높은 금액을 입찰해야 함
        if(!good) {
            return res.status(404).send('해당 상품은 존재하지 않습니다.');
        }
        if(good.price >= bid) {
            return res.status(403).send('시작 가격보다 높게 입찰해야 합니다.');
        }
        // 24시간 경매이므로 24시간이 지났다면 경매가 끝났을 것임
        // 그래서 24시간이 지났는지 체크
        if(new Date(good.createdAt).valueOf() + (24 * 60 * 60 * 1000) < new Date()) {
            return res.status(403).send('경매가 이미 종료되었습니다.');
        }
        // 입찰한 내역이 있다면 그 이전 입찰 내역보다 새로운 입찰가가 높은지 검사
        if(good.Auctions[0]?.bid >= bid) {
            return res.status(403).send('이전 입찰가보다 높아야 합니다.');
        }
        const result = await Auction.create({
            bid,
            msg,
            UserId: req.user.id,
            GoodId: req.params.id,
        });

        // 실시간으로 상품 아이디(방 아이디)를 통해 상품 입찰 방에 들어있는 사람들에게 실시간으로 입찰이 생성되었음을 알려줌
        // 실시간으로 Socket.IO 전파를 해주면 됨
        req.app.get('io').to(req.params.id).emit('bid', {
            bid: result.bid,
            msg: result.msg,
            nick: req.user.nick,
        })
        return res.send('ok');
    } catch (error) {
        console.error(error);
        next(error);
    }
};

exports.renderList = async (req, res, next) => {
    try {
        const goods = await Good.findAll({
            where: { SoldId: req.user.id },
            include: { model: Auction },
            order: [[{ model: Auction }, 'bid', 'DESC']],
        })
        res.render('list', { title: '낙찰 목록 - NodeAuction', goods });
    } catch (error) {
        console.error(error);
        next(error);
    }
}