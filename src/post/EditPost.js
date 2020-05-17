import React, { Component } from 'react';
import {singlePost, update} from './apiPost';
import {isAuthenticated} from '../auth';
import {Redirect} from 'react-router-dom';
import DefaultPost from '../images/default.jpg';

class EditPost extends Component {
    constructor(){
        super()
        this.state = {
            id: '',
            title: '',
            body: '',
            redirectToProfile: false,
            error: '',
            fileSize: 0,
            loading: false
        }
    }

    init = (postId) => {
        singlePost(postId)
        .then(data => {
            if (data.error) {
                this.setState({redirectToProfile: true})
            } else {
                this.setState({id: data._id, title: data.title, body: data.body, error:'',})
            }
        })
    }


    componentDidMount() {
        this.postData = new FormData()
        const postId = this.props.match.params.postId
        this.init(postId);
    }   

    isValid = () => {
        const {title,body,fileSize} = this.state
        if (fileSize > 1000000) {    //1mb file size
            this.setState({error: "File size exceeds 1MB!"})
            return false
        }
        if (title.length === 0 || body.length === 0) {
            this.setState({error: "All fields are required"})
            return false
        }
        return true 
    }

    handleChange = (name) => event => {
        this.setState({error: ''})
        const value = name === 'photo' ? event.target.files[0] : event.target.value
        const fileSize = name === 'photo' ? event.target.files[0].size : 0
        this.postData.set(name, value)
        this.setState({ [name]: value, fileSize: fileSize})
    };

    clickSubmit = event => {
        event.preventDefault();
        if (this.isValid()) {
            this.setState({ loading : true })
            const postId = this.state.id
            const token = isAuthenticated().token
            update(postId, token, this.postData)
            .then(data => {
                if (data.error) this.setState({error: data.error})
                else {
                    this.setState({ loading:false, title:"", body:"", photo:"", redirectToProfile: true })
                }
            })
        }
    }

    editePostForm = (title, body) => (
        <form>
            <div className="form-group">
                <label className="text-muted">Post Photo</label>
                <input onChange={this.handleChange("photo")} type="file" accept="image/*" className="form-control"/>
            </div>
            <div className="form-group">
                <label className="text-muted">Title</label>
                <input onChange={this.handleChange("title")} type="text" className="form-control" value={title}/>
            </div>
            <div className="form-group">
                <label className="text-muted">Body</label>
                <textarea onChange={this.handleChange("body")} type="text" className="form-control" value={body}/>
            </div>
            <button onClick={this.clickSubmit} className="btn btn-raised btn-primary">Confirm Changes</button>
        </form>
    )

    render() {
        const {id,title, body,redirectToProfile, error, loading} = this.state

        if (redirectToProfile) {
            return <Redirect to={`/user/${isAuthenticated().user._id}`}/>
        }
        return (
            <div className="container">
                <h2 className="mt-5 mb-5">Edit Post</h2>

                <div className="alert alert-danger" style={{display: error ? "": "none"}}>
                    {error}
                </div> 

                {loading ? (
                    <div className="jumbotron text-center">
                        <h2>Loading...</h2>
                    </div> ) : (
                        ""
                    )}

                <img style={{height: "200px", width: 'auto'}} className="img-thumbnail" src={`${process.env.REACT_APP_API_URL}/post/photo/${id}?${new Date().getTime()}`} onError={i => i.target.src = `${DefaultPost}`} alt={title} />

                {this.editePostForm(title,body)}
            </div>
        );
    }   
}

export default EditPost;