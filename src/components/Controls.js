// import { ZoomIn, ZoomOut, CropFree } from "@material-ui/icons";
// import { ReactComponent as CropFree } from './public/assets/crop_free.svg';

export default function Control({}) {

    return (
        <div className="ViewControl">
            <div className="inner">

            <img src={process.env.PUBLIC_URL + "/assets/crop_free.svg"} />

                {/* <IconButton aria-label="delete" size="medium" color="secondary" onClick={() => controls.zoomIn()}>
                    <ZoomIn />
                </IconButton>
                <IconButton aria-label="delete" size="medium" color="secondary" onClick={() => controls.zoomOut()}>
                    <ZoomOut />
                </IconButton>
                <IconButton aria-label="delete" size="medium" color="secondary" onClick={() => controls.reset()}>
                    <CropFree />
                </IconButton> */}
                </div>
        </div>
    )
}