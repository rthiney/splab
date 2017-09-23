
export interface IParam{
    id?: number;

    name?: string;
}
export class Param implements IParam{

    id: number;
    name: string;

    constructor(_id: number, _name: string)    {
        this.id = _id;
       this. name = _name;
    }
}

// export class Country implements IParam
// {

//     id: number;
//     name: string;

//     constructor(_id: number, _name: string)
//     {
//         this.id = _id;
//         this.name = _name;
//     }
// }