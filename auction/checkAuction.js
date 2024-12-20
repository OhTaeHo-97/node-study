const { scheduleJob } = require('node-schedule');
const { Op } = require('sequelize');
const { Good, Auction, User, sequelize } = require('./models');
module.exports = async () => {
    console.log('checkAuction');
    try {
        // 서버가 꺼졌다가 다시 재시작 됐을 때
        // 24시간이 지난 낙찰자 없는 경매들을 찾아 낙찰자들을 넣어줌
        //  - 서버가 죽은 기간동안 경매가 끝났을 수도 있음
        //  - 그럼 서버가 죽어서 경매 낙찰자들을 정하지 못한 것들을 찾아 낙찰자들을 먼저 만들어줌
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); // 어제 시간
        const targets = await Good.findAll({ // 24시간이 지난 낙찰자 없는 경매들
            where: {
                SoldId: null,
                createdAt: { [Op.lte]: yesterday },
            },
        });
        targets.forEach(async (good) => {
            const success = await Auction.findOne({
                where: { GoodId: good.id },
                order: [['bid', 'DESC']],
            });
            if(!success) { return; }
            await good.setSold(success.UserId);
            await User.update({
                money: sequelize.literal(`money - ${success.bid}`),
            }, {
                where: { id: success.UserId },
            });
        });

        // 진행 중인 경매들을 대상으로 스케쥴링 작업
        const ongoing = await Good.findAll({ // 24시간이 지나지 않은 낙찰자 없는 경매들
            where: {
                SoldId: null,
                createdAt: { [Op.gte]: yesterday },
            },
        })
        ongoing.forEach((good) => {
            const end = new Date(good.createdAt);
            end.setDate(end.getDate() + 1); // 생성일 24시간 뒤가 낙찰 시간
            const job = scheduleJob(end, async () => {
                const success = await Auction.findOne({
                    where: { GoodId: good.id },
                    order: [['bid', 'DESC']],
                });
                await good.setSold(success.UserId);
                await User.update({
                    money: sequelize.literal(`money - ${success.bid}`),
                }, {
                    where: { id: success.UserId },
                });
            });
            job.on('error', (err) => {
                console.error('스케쥴링 에러', err);
            });
            job.on('success', () => {
                console.log('스케쥴링 성공');
            });
        });
    } catch (error) {
        console.error(error);
    }
}