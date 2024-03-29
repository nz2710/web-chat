import * as UserApi from "../api/UserRequests";


export const updateUser=(data)=> async(dispatch)=> {
    dispatch({type: "UPDATING_START"})
    try{
        dispatch({type: "UPDATING_SUCCESS", data: data})
    }   
    catch(error){
        dispatch({type: "UPDATING_FAIL"})
    }
}


export const followUser = (id, data)=> async(dispatch)=> {
    dispatch({type: "FOLLOW_USER", data: id})
    UserApi.followUser(id, data)
}

export const unfollowUser = (id, data)=> async(dispatch)=> {
    dispatch({type: "UNFOLLOW_USER", data: id})
    UserApi.unfollowUser(id, data)
}