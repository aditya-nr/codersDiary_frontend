import React, { useState } from 'react'
import styles from './css.module.css';
import { Container } from '../shared'
import { Button, Slider, Switch, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Close, Delete, Done, Edit, Save } from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { DevTool } from '@hookform/devtools';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, removeTask } from '../../context';
import { BASE_URL } from '../../config';

const AddEditSection = (props) => {
    const { tid, target, type, title, task, desc, priority, hidePortal, setData } = props;

    const [_type, setType] = useState(type);
    const [editable, setEditable] = useState(tid == null);
    const [done, setDone] = useState(false);

    const state = useSelector(state => state.data);
    const dispatch = useDispatch();

    const { register, control, handleSubmit, formState: { errors } } = useForm();
    const handleChange = (event, newType) => {
        setType(newType);
    };

    const handleEditable = () => {
        setEditable(pre => !pre);
    }
    const handleDelete = async () => {
        let data = {
            tid,
            pid: state.pid,
            did: state.did,
            token: state.user.token
        }
        try {
            let res = await fetch(`${BASE_URL}/task`, {
                method: "DELETE", // Specify the method as POST
                headers: {
                    "Content-Type": "application/json", // Set the Content-Type header
                },
                body: JSON.stringify(data), // Convert data to JSON string
            });
            res = await res.json();

            console.log(res);
            if (!res.success) {
                return;
            }
            dispatch(removeTask({ target: target, tid: tid }));
            hidePortal();
        } catch (error) {
            console.log(`error :: \n`, error);
        }
    }
    const handleSave = async (data) => {
        data = {
            ...data,
            tid,
            target,
            type: _type,
            token: state.user.token,
            pid: state.pid,
            did: state.did
        };
        let old_target = data.target;
        if (done) {
            data.target = _type == "DSA" ? "QUESTION" : "WORK";
        }

        let method = tid ? "PATCH" : "POST";
        try {
            let res = await fetch(`${BASE_URL}/task`, {
                method, // Specify the method as POST
                headers: {
                    "Content-Type": "application/json", // Set the Content-Type header
                },
                body: JSON.stringify(data), // Convert data to JSON string
            });
            res = await res.json();

            console.log(res);
            if (!res.success) {
                return;
            }
            // update task
            // --remove old entry
            if (tid != null) {
                dispatch(removeTask({ target: old_target, tid }));
                setData(data);
            }
            dispatch(addTask({ target: data.target, tid: res.tid }));
            hidePortal();
        } catch (error) {
            console.log(`error :: \n`, error);
        }
    }
    return (
        <div className={styles.wrapper}>
            <div className={styles.addEditContainer}>
                <Container>
                    <div className={styles.ae_close}>
                        <Button
                            onClick={hidePortal}>
                            <Close color='error' />
                        </Button>
                    </div>
                    <form noValidate onSubmit={handleSubmit(handleSave)} >
                        {/* type */}
                        <div className={styles.ae_section}>
                            <Typography>Task Type</Typography>
                            <ToggleButtonGroup
                                color="primary"
                                value={_type}
                                exclusive
                                onChange={handleChange}
                                disabled={!editable || tid != null}
                            >
                                <ToggleButton value="DSA">DSA</ToggleButton>
                                <ToggleButton value="PROJECT">PROJECT</ToggleButton>
                                <ToggleButton value="THEORY">THEORY</ToggleButton>
                                <ToggleButton value="OTHERS">OTHERS</ToggleButton>
                            </ToggleButtonGroup>
                        </div>
                        {/* title */}
                        <div className={styles.ae_section}>
                            <Typography>Title</Typography>
                            <TextField
                                variant="standard"
                                disabled={!editable}
                                {...register('title', {
                                    value: title,
                                    required: "* required"
                                })}
                                error={!!errors.title}
                                helperText={errors.title?.message}
                            />
                        </div>
                        {/* task */}
                        <div className={styles.ae_section}>
                            <Typography>Task</Typography>
                            <TextField
                                variant="standard"
                                disabled={!editable}
                                {...register('task', {
                                    required: "* required",
                                    value: task
                                })}
                                error={!!errors.task}
                                helperText={errors.task?.message}
                            />
                        </div>
                        {/* desc */}
                        <div className={styles.ae_section}>
                            <Typography>Description</Typography>
                            <TextField
                                multiline
                                rows={4}
                                variant="outlined"
                                disabled={!editable}
                                {...register('desc', {
                                    value: desc
                                })}
                            />
                        </div>
                        {/* priority */}
                        <div className={styles.ae_section}>
                            <Typography>Priority</Typography>
                            <Slider
                                valueLabelDisplay="auto"
                                step={1}
                                marks
                                min={0}
                                max={9}
                                disabled={!editable}
                                defaultValue={priority}
                                {...register('priority')}
                            />
                        </div>
                        {/* mark as done */}
                        {
                            (target == "TODO") &&
                            <div className={styles.ae_section}>
                                <Typography>Done</Typography>
                                <Switch
                                    color="primary"
                                    defaultChecked={done}
                                    onChange={() => setDone(pre => !pre)}
                                />
                            </div>
                        }

                        {/* buttons */}
                        <div className={styles.ae_action}>
                            <Button
                                color='error'
                                disabled={tid == null}
                                onClick={handleDelete}
                            ><Delete /></Button>
                            <div className={styles.ae_action_left}>
                                {
                                    (tid != null) &&
                                    <Button onClick={handleEditable} >
                                        {
                                            !editable ? <Edit /> : <Done />
                                        }
                                    </Button>
                                }
                                <Button
                                    type='submit'
                                ><Save /></Button>
                            </div>
                        </div>
                    </form>
                    <DevTool control={control} />
                </Container>
            </div>
        </div>
    )
}

export default AddEditSection