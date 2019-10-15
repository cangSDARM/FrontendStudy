//1、考虑到性能问题，如何快速生成巨大数组 array 并从中随机取出部分不重复元素？
(function(len, num){
    /**genArray
     * Gen The Array
     * @param  {int}   the length of array
     * @return {Array} the array
     */
    const genArray = (len)=>{
        return Array.from({ length: len }, (v, i) => i);
    }
    /**
     * gen the random array
     * @param  {Array} arr  original array
     * @param  {int} genNum gen number is needed
     * @return {Array} random array
     */
    const genRandom = (arr, genNum)=>{
        let len = arr.length;
        let result = new Set();
        for(let i=0; i<genNum; i++){
            addNum();
        }

        //Help tool
        function addNum() {
            let luckyOne = Math.floor(Math.random() * (len - 1));
            if (!resultSet.has(originArr[luckyOne])) {
                resultSet.add(originArr[luckyOne]);
            } else {
                addNum();
            }
        }
        return Array.from(result);
    }
    let arr = genArray(len);
    console.log(genRandom(arr, num));
})(200000, 10000)
