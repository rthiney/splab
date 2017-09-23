

export class UserData {
    remoteFavsTable: any;
    image: string;
    first: any;
    updated_at: any;
    created_at: any;
    global_id: any;
    fos_id: number = -1;
    doctor_id: number;
    roles: string[] = [];
    permissions: string[] = [];
    idToken: string;
    latitude: string;
    longitude: string;
    favorites: string[] = [];
    last: any;
    loggedIn: boolean = false;
    name?: string;
    picture?: string;
    email?: string;
    tag?: string;
    userId?: string;
}