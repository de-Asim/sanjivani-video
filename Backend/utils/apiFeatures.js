class ApiFeature {
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr;
    }
    search(){
        const keyword=this.queryStr.s 
        ? {
            title:{
                $regex:this.queryStr.s,
                $options:'i',
            },
        }
        : {};
        this.query = this.query.find({...keyword});
        return this;
    }

    category(){
        const keyword = this.queryStr.c
        ? {
            category:this.queryStr.c
        }
        : {};
        console.log(keyword);
        this.query = this.query.find({...keyword})
        return this;
    }

    pagination(){
        const productPerPage=5;
        const currentPage = this.queryStr.p || 1;
        const skip = productPerPage*(currentPage-1);
        this.query = this.query.limit(productPerPage).skip(skip);
        return this;
    }

}
module.exports = ApiFeature;