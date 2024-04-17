class ApiErrors extends Error{
    constructor(
        statuscode,
        message="Something went wrong",
        errors=[],
        stack="",
    ){
        super(message)
        this.statusCode=statuscode;
        this.data=null;
        this.message=message;
        this.success=false;
        this.errors=errors;

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }// this can be skipped.
    }
}
export {ApiErrors}