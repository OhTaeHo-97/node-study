import Post from '../models/post';
import Hashtag from '../models/hashtag';
import {RequestHandler} from "express";

const afterUploadImage: RequestHandler = (req, res) => {
    // multer를 통해서 이미지를 업로드하면 single()일 경우 req.file이 생김
    // multer를 통해서 이미지를 업로드하면 array(), fields()일 경우 req.files가 생김
    console.log('req.file', req.file); // req.file에서 에러 발생 => multer에 대한 타입 설치를 해주면 해결됨
    // types/multer.d.ts로 가보면 Request에 file, files 속성이 있음!
    //  -> 합쳐준 것!!
    // 이미지 업로드가 끝나면 업로드된 이미지 url을 다시 프론트로 보내줌
    // 프론트에서는 나중에 게시글 업로드할 때 해당 url을 같이 보내줌
    res.json({ url: `/img/${req.file?.filename}` });
}

const uploadPost: RequestHandler = async (req, res, next) => {
    // req.body.content, req.body.url
    try {
        // 게시글 등록
        const post = await Post.create({
            content: req.body.content,
            img: req.body.url,
            // 유저 아이디 -> req.user가 로그인한 사용자 객체
            //  - 거기서 id만 뽑아내면 됨
            UserId: req.user?.id, // req.user가 없을 수도 있으니 ? 붙여줌
        });

        // 이러한 방식으로도 할 수 있음
        // const post = await Post.create({
        //     content: req.body.content,
        //     img: req.body.url,
        // });
        // await post.addUser(req.user.id);

        // 만약 게시글이 아래와 같다고 하자
        //  - 노드 교과서 너무 재밌어요. #노드교과서 #익스프레스 짱짱
        // 그럼 우리는 이 문자열에서 해시태그 두 개를 추출해야 함
        //  - 그래야 이 게시글에 해시태그 2개가 달려있다는 것을 확인할 수 있음
        //  - 이걸 어떻게 확인할까?
        //      - 문자열에서 특정 패턴이 일치하는지를 검사하거나 특정 패턴을 추출해내려면 정규표현식이 가장 쉬움
        //      - 정규표현식을 따로 공부해두자!
        //  - 해시태그를 가리키는 정규 표현식
        //      - /#[^\s#]*/g
        //          - #으로 시작하고 # 또는 공백(\s)이 아닌 나머지가 0번 이상 반복하는 것을 찾기
        //          - g flag를 통해 문자열 내에서 해당 패턴에 맞는 모든 문자열을 검색
        //      - match()를 통해 추출하고 위 문자열에서 추출하면 아래와 같은 결과가 나옴
        //          - ['#노드교과서', '#익스프레스']
        //          - 만약 일치하는 결과가 없다면 null이 반환됨
        const hashtags: string[] = req.body.content.match(/#[^\s#]*/g);
        if (hashtags) {
            const result = await Promise.all(hashtags.map((tag) => {
                // findOrCreate()
                //  - Sequelize에서 제공해주는 것
                //  - 기존 데이터에서 찾으면(있으면) 그것을 찾아오고, 없으면 새로 만들어 찾아옴
                //      - 즉, 있던 없던 결국 하나는 가져올 것임(없으면 만들어서 가져오니)
                //      - Sequelize 공식 문서를 보면서 이런 기능들을 한 번 찾아보면 좋음
                //          - 공식문서를 쭉 읽어보며 이런 기능이 있구나 하면서 인지하고 있다가 그걸 가져와서 사용
                return Hashtag.findOrCreate({
                    where: { title: tag.slice(1).toLowerCase() }
                });
            }));
            console.log('result', result);
            // result에 hashtag들이 기존에 있던 것을 가져오거나 새로 생기거나 해서 들어있음
            // 그것과 post와 이어주는 것!
            //  - post와 hashtag가 다대다 관계가 저절로 생기는 것!
            await post.addHashtags(result.map(r => r[0]));
        }
        // 게시글 업로드 했으면 메인 페이지로 다시 redirect하면 새로운 게시글이 거기에 떠 있어야 할 것임
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
}

export { afterUploadImage, uploadPost };