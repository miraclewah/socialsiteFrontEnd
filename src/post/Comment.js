import React, { Component } from 'react';
import {comment, uncomment} from './apiPost';
import {isAuthenticated} from '../auth';
import {Link} from 'react-router-dom';
import DefaultProfile from '../images/avatar.png';

class Comment extends Component {
    state = {
        text: "",
        error: ""
    }

    handleChange =(event) => {
        this.setState({error: ""});
        this.setState({text: event.target.value});
    }


    isValid = () => {
        const {text} = this.state
        if (!text.length > 0 || text.length > 150) {
            this.setState({error: "Comment should not be empty or exceed 150 characters"})
            return false
        }
        return true
    }   

    addComment = (e) => {
        e.preventDefault()
        if (!isAuthenticated()) {
            this.setState({error: "Please sign in to leave a comment"})
            return false
        }
        if (this.isValid()) {
            const userId = isAuthenticated().user._id
            const token = isAuthenticated().token
            const postId = this.props.postId

            comment(userId,token,postId,{text: this.state.text})
            .then(data => {
                if (data.error){
                    console.log(data.error)
                } else {
                    this.setState({text: ''})
                    // dispatch fresh list of comments to parent component {singlePost}
                    this.props.updateComments(data.comments)
                }
            })
        }
    }

    deleteComment = (comment) => {
        const userId = isAuthenticated().user._id
        const token = isAuthenticated().token
        const postId = this.props.postId

        uncomment(userId,token,postId,comment)
        .then(data => {
            if (data.error){
                console.log(data.error)
            } else {
                this.props.updateComments(data.comments)
            }
        })
    }

    //prompt user to ask for confirmation for delete
    deleteConfirmed =(comment) => {
        let answer = window.confirm("Are you sure to delete your comment?")
        if (answer) {
            this.deleteComment(comment)
        }
    }

    render() {
        const {comments} = this.props
        const {error} = this.state
        return (
            <div>
                <h2 className="mt-5 mb-5">Leave a comment</h2>

                <form onSubmit={this.addComment}>
                    <div className="form-group">
                        <input type="text" onChange={this.handleChange} className="form-control" value={this.state.text} placeholder="Leave a comment..." />
                        <button className="btn btn-raised btn-success mt-1">Post Comment</button>
                    </div>
                </form>
                <div className="alert alert-danger" style={{display: error ? "": "none"}}>
                    {error}
                </div> 
                <hr/>
                <div className="col-md-12">
                        <h3 className="text-primary">{comments.length} Comments</h3>
                        <hr/>
                        {comments.map((comment,i) => (
                            <div key={i}>
                                    <div>
                                        <Link to={`/user/${comment.postedBy._id}`}>
                                            <img className="float-left mr-2"
                                                style={{borderRadius:"50%", border:'1px solid black'}}
                                                height="30px"
                                                width="30px"
                                                src={`${process.env.REACT_APP_API_URL}/user/photo/${comment.postedBy._id}`} 
                                                onError={i => (i.target.src = `${DefaultProfile}`)} 
                                                alt={comment.postedBy.name}
                                            />
                                        </Link>
                                            <div>
                                                <p className="lead">{comment.text}</p>
                                                <p className="font-italic mark">
                                                    Posted by <Link to={`${comment.postedBy._id}`}>{comment.postedBy.name}{" "}</Link>
                                                    on {new Date(comment.created).toDateString()}
                                                    <span>
                                                        {isAuthenticated().user && isAuthenticated().user._id === comment.postedBy._id  && <>
                
                                                        <span onClick={()=>this.deleteConfirmed(comment)} className="text-danger float-right mr-1" style={{cursor:"pointer"}}>
                                                            Delete
                                                        </span>
                                                        </>
                                                        }
                                                    </span>
                                                </p>
                                            </div>
                                    </div>
                                
                            </div>
                        ))}
                    </div>
            </div>
        );
    }
}

export default Comment;