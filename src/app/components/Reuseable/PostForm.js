"use client";
import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, storage } from "@/app/firebase/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { MdLinkedCamera } from "react-icons/md";
import { useRouter } from 'next/router';

const PostForm = ({ postCategory, formTitle }) => {
    const auth = getAuth();
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        postTitle: "",
        postDescription: "",
        rating: "",
        InternalScore: "",
        sourceLink: "",
        SourceName: "",
        SourceDescription: "",
        postCategory: postCategory,
        ContentID: "",
        timePublished: null,
        SourceImage: null,
        postPhoto: null
    });

    const [sourceImageFile, setSourceImageFile] = useState(null);
    const [postPhotoFile, setPostPhotoFile] = useState(null);
    const [loading, setLoading] = useState(false);

    // Check if user is authenticated
    useEffect(() => {
        onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                alert("You need to be logged in to upload posts.");
            }
        });
    }, [auth]);

    // Handle form field changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Handle image uploads for both Source Image and Post Photo
    const handleImageChange = (e, setImageFile) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("You must be logged in to add a post.");
            return;
        }
        setLoading(true);

        try {
            let sourceImageUrl = null;
            let postPhotoUrl = null;

            // Upload Source Image to Firebase Storage if provided
            if (sourceImageFile) {
                const sourceImageRef = ref(storage, `users/${user.uid}/${sourceImageFile.name}`);
                await uploadBytes(sourceImageRef, sourceImageFile);
                sourceImageUrl = await getDownloadURL(sourceImageRef);
            }

            // Upload Main Post Photo to Firebase Storage if provided
            if (postPhotoFile) {
                const postPhotoRef = ref(storage, `users/${user.uid}/${postPhotoFile.name}`);
                await uploadBytes(postPhotoRef, postPhotoFile);
                postPhotoUrl = await getDownloadURL(postPhotoRef);
            }

            // Create formData to be submitted to Firestore
            const postData = {
                postTitle: formData.postTitle,
                postDescription: formData.postDescription,
                rating: formData.rating,
                InternalScore: formData.InternalScore ? Number(formData.InternalScore) : 0,
                sourceLink: formData.sourceLink,
                SourceName: formData.SourceName,
                SourceDescription: formData.SourceDescription,
                ContentID: formData.ContentID,
                timePublished: formData.timePublished ? Timestamp.fromDate(new Date(formData.timePublished)) : null,
                SourceImage: sourceImageUrl,  
                postPhoto: postPhotoUrl,      
                postOwner: user.uid,
                postCategory: formData.postCategory,
            };

            // Add the post to Firestore
            const postsCollection = collection(db, "userPosts");
            await addDoc(postsCollection, postData);

            alert(`${postCategory} added successfully!`);
            window.location.reload()
            // Reset form after successful submission
            setFormData({
                postTitle: "",
                postDescription: "",
                rating: "",
                InternalScore: "",
                sourceLink: "",
                SourceName: "",
                SourceDescription: "",
                ContentID: "",
                timePublished: null,
                SourceImage: null,
                postPhoto: null
            });
            setSourceImageFile(null);
            setPostPhotoFile(null);
        } catch (error) {
            console.error("Error adding post: ", error);
            alert("Error adding post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 p-5">
            <h1 className="text-white text-2xl font-bold mb-6">{formTitle}</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="postTitle"
                    placeholder={`${postCategory} Title`}
                    value={formData.postTitle}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded bg-transparent text-white focus:placeholder-white placeholder-white border-2 border-[#31363f] focus:border-yellow-500 focus:outline-none"
                />

                {/* Description */}
                <textarea
                    name="postDescription"
                    placeholder={`${postCategory} Description`}
                    value={formData.postDescription}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded bg-transparent text-white focus:placeholder-white placeholder-white border-2 border-[#31363f] focus:border-yellow-500 focus:outline-none"
                    rows={4}
                />

                <div className="grid grid-cols-3 gap-4">
                    <input
                        type="text"
                        name="rating"
                        placeholder="Rating"
                        value={formData.rating}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded bg-transparent text-white focus:placeholder-white placeholder-white border-2 border-[#31363f] focus:border-yellow-500 focus:outline-none"
                    />
                    <input
                        type="number"
                        name="InternalScore"
                        placeholder="Internal Score"
                        value={formData.InternalScore}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded bg-transparent text-white focus:placeholder-white placeholder-white border-2 border-[#31363f] focus:border-yellow-500 focus:outline-none"
                        required
                    />
                    <input
                        type="datetime-local"
                        name="timePublished"
                        placeholder="Select Date & Time"
                        value={formData.timePublished}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded bg-transparent text-white focus:placeholder-white placeholder-white border-2 border-[#31363f] focus:border-yellow-500 focus:outline-none"
                        required
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <input
                        type="text"
                        name="sourceLink"
                        placeholder="Source Link"
                        value={formData.sourceLink}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded bg-transparent text-white focus:placeholder-white placeholder-white border-2 border-[#31363f] focus:border-yellow-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        name="SourceName"
                        placeholder="Source Name"
                        value={formData.SourceName}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded bg-transparent text-white focus:placeholder-white placeholder-white border-2 border-[#31363f] focus:border-yellow-500 focus:outline-none"
                    />
                    <div className="flex items-center justify-center bg-gray-800 rounded p-3">
                        <label
                            htmlFor="sourceImage"
                            className="flex flex-col items-center cursor-pointer text-gray-500"
                        >
                            <MdLinkedCamera size={20} className="text-white"/>
                            <span className="mt-2 text-white text-xs">Add Source Image</span>
                            <input
                                type="file"
                                id="sourceImage"
                                name="sourceImage"
                                accept="image/*"
                                onChange={(e) => handleImageChange(e, setSourceImageFile)}
                                className="hidden"
                            />
                        </label>

                        {sourceImageFile && (
                            <div className="ml-3">
                                <Image
                                    src={URL.createObjectURL(sourceImageFile)}
                                    alt="Source Image"
                                    className="w-12 h-12 object-cover rounded"
                                    width={100}
                                    height={100}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="SourceDescription"
                        placeholder="Source Description"
                        value={formData.SourceDescription}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded bg-transparent text-white focus:placeholder-white placeholder-white border-2 border-[#31363f] focus:border-yellow-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        name="ContentID"
                        placeholder="Content ID"
                        value={formData.ContentID}
                        onChange={handleInputChange}
                        className="w-full p-3 rounded bg-transparent text-white focus:placeholder-white placeholder-white border-2 border-[#31363f] focus:border-yellow-500 focus:outline-none"
                        required
                    />
                </div>

                <div className="w-full h-40 rounded border-2 border-[#31363f] relative mt-4 p-4">
                    <div className="w-[30%] mob-w-50 h-full bg-transparent rounded flex justify-center items-center">
                        {!postPhotoFile && (
                            <label
                                htmlFor="postPhoto"
                                className="flex flex-col items-center cursor-pointer text-gray-500"
                            >
                                 <MdLinkedCamera size={60} className="text-white"/>
                                 <span className="mt-2 text-white text-xs">Add Source Image</span>
                                <input
                                    type="file"
                                    id="postPhoto"
                                    name="postPhoto"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, setPostPhotoFile)}
                                    className="hidden"
                                />
                            </label>
                        )}

                        {postPhotoFile && (
                            <div className="w-full h-full">
                                <Image
                                    src={URL.createObjectURL(postPhotoFile)}
                                    alt="Post Image"
                                    className="w-full h-full object-cover rounded"
                                    width={100}
                                    height={100}
                                />
                                <button
                                    onClick={() => setPostPhotoFile(null)}
                                    className="absolute top-2 right-2 red-color p-1"
                                >
                                    &times;
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg"
                    disabled={loading}
                >
                    {loading ? `Adding ${postCategory}...` : `Add ${postCategory}`}
                </button>
            </form>
        </div>
    );
};

export default PostForm;
