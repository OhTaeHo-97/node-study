const Sequelize = require('sequelize');

class User extends Sequelize.Model {
    static initiate(sequelize) {
        User.init({ // 테이블에 대한 설정
            email: {
                type: Sequelize.STRING(40),
                allowNull: true,
                unique: true, // email이 필수는 아니지만 있으면 고유해야 함
            },
            nick: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING(100), // 비밀번호는 암호화되기 때문에 길어져서 훨씬 더 많은 글자수를 차지함
                allowNull: true,
            },
            provider: {
                // Sequelize.STRING -> 사용자가 자유롭게 아무거나 입력 가능
                // Sequelize.ENUM -> 사람들이 local 혹은 kakao 둘 중 하나만 적게끔 제한을 두는 것
                type: Sequelize.ENUM('local', 'kakao'),
                allowNull: false,
                defaultValue: 'local'
            },
            snsId: {
                // 소셜 로그인을 할 때 SNS ID라는 것을 줌
                // SNS 통해서 로그인하면 그 ID를 여기에 기록할 것임
                // 그러면 이것이 이메일 같은 역할을 수행할 수 있음
                //  - 만약 email이 없으면 snsId라도 있어야 로그인이 됨
                //  - snsId도 없으면 이메일로 가입한 사람
                //      - 그런 사람은 provider가 local일 것임
                // email도, snsId도 allowNull이 true면 둘 다 없어도 되는 것 아닌가?
                //  - 구조상은 그렇지만 로그인이 안 됨 -> 그러나 그런 것은 여기서 표현하기 애매함
                //  - Sequelize에서는 검사해주는 기능이 있음
                //      - 회원가입 전에 이메일이나 snsId 둘 중 하나는 존재하는지 검사할 수 있음
                //      - 그런 기능도 추가적으로 제공함 -> Sequelize에서 validation 키워드로 검색해보면 됨
                //          - 저장하기 전에 검사하는 기능을 어떻게 쓰는지 한 번 보면 좋음
                type: Sequelize.STRING(30),
                allowNull: true,
            }
        }, {
            sequelize,
            timestamps: true, // createdAt(생성일), updatedAt(마지막 수정 시간) 컬럼을 자동으로 만들어줌
            underscored: false, // true면 created_at, updated_at 이렇게 됨
            modelName: 'User', // JS에서 쓰이는 이름
            tableName: 'users', // DB의 테이블 이름
            paranoid: true, // deletedAt 컬럼이 생김(유저 삭제 시간을 저장)
            charset: 'utf8',
            collate: 'utf8_general_ci',
        })
    }

    static associate(db) {
        // 사용자 - 게시글 관계는 1대다 관계
        db.User.hasMany(db.Post);
        // 팔로잉, 팔로워 -> 다대다 관계
        //  - 한 사람이 여러 명을 팔로잉 할 수 있고
        //  - 그 사람이 다른 사람에게 여러 번 팔로잉 당할 수도 있음
        // 다대다 관계 -> 중간 테이블이 하나 생김
        db.User.belongsToMany(db.User, { // 팔로워 - 유명한 연예인이 있다면 나는 그 사람의 팔로워
            // 내가 팔로잉 하고 있는 사람을 찾으려면 내 아이디를 팔로워 아이디에서 찾아야 함
            //  - 내 아이디를 찾아야지만 내가 팔로잉하고 있는 사람을 찾을 수 있음
            //  - 그래서 foreignKey와 as가 반대인 것!
            // 유명 연예인의 팔로워를 찾고 싶으면 유명 연예인의 아이디를 찾아야 그 사람의 팔로워들을 찾을 수 있음
            // 나를 먼저 찾아야 다른 관계를 갖고 있는 사람들을 찾을 수 있다!
            foreignKey: 'followingId', // 누구를 찾는가(유명 연예인의 아이디를 찾아야지만)
            as: 'Followers', // (팔로워들을 찾을 수 있다)
            through: 'Follow'
        })
        db.User.belongsToMany(db.User, { // 팔로잉 - 유명한 연예인이 있다면 유명 연예인은 내 팔로잉
            foreignKey: 'followerId', // 내 아이디를 찾아야지만
            as: 'Followings', // 내가 팔로잉하는 사람을 찾을 수 있다
            through: 'Follow'
        })
    }
}

module.exports = User;