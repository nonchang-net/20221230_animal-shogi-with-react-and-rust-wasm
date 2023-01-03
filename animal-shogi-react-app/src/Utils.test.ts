
import Utils from './Utils';

test('randomRange(5)は0以上5未満の数字を返すことを10回テストする', () => {
    for(let i=0 ; i<10 ; i++){
        // console.log("jest test now")
        const rnd = Utils.randomRange(5)
        expect(rnd).toBeLessThan(5);
        expect(rnd).toBeGreaterThan(-1);
    }
});