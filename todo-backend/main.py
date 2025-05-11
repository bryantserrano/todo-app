from fastapi import FastAPI, HTTPException
from models import Task
from crud import (
    create_task,
    get_tasks,
    get_task_by_id,
    update_task,
    delete_task
)
from logging_config import logger

app = FastAPI()


@app.post("/tasks")
def create(task: Task):
    try:
        task_id = create_task(task)
        return {"id": task_id}
    except Exception as e:
        logger.exception("Error creating task")
        raise HTTPException(status_code=500, 
                            detail=f"Failed to create task. Error: {e}")

@app.get("/tasks")
def read():
    try:
        return get_tasks()
    except Exception as e:
        logger.exception("MongoDB error in /tasks endpoint")
        raise HTTPException(status_code=500, 
                            detail=f"MongoDB connection failed. Error: {e}")


@app.get("/tasks/{task_id}")
def read_task(task_id: str):
    try:
        task = get_task_by_id(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return task
    except Exception:
        logger.exception("Error fetching specific task")
        raise HTTPException(status_code=500, detail="Failed to fetch task")


@app.put("/tasks/{task_id}")
def update(task_id: str, task: Task):
    try:
        count = update_task(task_id, task)
        if count == 0:
            raise HTTPException(
                status_code=404, detail="Task not found or no change made"
            )
        return {"updated": count}
    except Exception as e:
        logger.exception("Error updating task")
        raise HTTPException(status_code=500, detail="Failed to update task")


@app.delete("/tasks/{task_id}")
def delete(task_id: str):
    try:
        count = delete_task(task_id)
        if count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"deleted": count}
    except Exception as e:
        logger.exception("Error deleting task")
        raise HTTPException(status_code=500, detail="Failed to delete task")
