import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import './styles.css'
import { FiUpload } from 'react-icons/fi'

interface Props {
    onFileUploaded: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({onFileUploaded}) => {
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    const fileUrl = URL.createObjectURL(file);
    setSelectedFileUrl(fileUrl);
    onFileUploaded(file);
  }, [onFileUploaded])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept: 'image/*'})

  const [selectedFileUrl, setSelectedFileUrl] = useState('')

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*"/>
      {
        selectedFileUrl 
        ? 
        <img src={selectedFileUrl} alt="Point thumbnail"></img> 
        : 
        <p><FiUpload></FiUpload>Image do estabelecimento</p>
        // isDragActive ?
        //   <p>Drop the files here ...</p> :
        //   <p>Drag 'n' drop some files here, or click to select files</p>
        
      }
    </div>
  )
}

export default Dropzone;