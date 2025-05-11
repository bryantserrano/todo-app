from bson import ObjectId
from models import Task
from database import tasks_collection
from fastapi import HTTPException
from logging_config import logger
from pymongo.errors import PyMongoError


def create_task(task: Task):
    try:
        if tasks_collection.find_one(
            {"title": {"$regex": f"^{task.title}$", "$options": "i"}}
        ):
            raise HTTPException(
                status_code=400, detail="Task with same title already exists."
            )
        result = tasks_collection.insert_one(task.model_dump())
        logger.info(f"Task created with ID: {result.inserted_id}")
        return str(result.inserted_id)
    except PyMongoError as e:
        logger.exception(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail="Error creating task")


def get_tasks():
    try:
        tasks = [{**task, "_id": str(task["_id"])} for task in tasks_collection.find()]
        logger.info(f"Retrieved {len(tasks)} tasks.")
        return tasks
    except PyMongoError as e:
        logger.exception(f"Error retrieving tasks: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving tasks")


def get_task_by_id(task_id: str):
    try:
        task = tasks_collection.find_one({"_id": ObjectId(task_id)})
        if task:
            task["_id"] = str(task["_id"])
            return task
        return None
    except Exception as e:
        logger.exception(f"Invalid task ID. Error: {e}")
        raise


def update_task(task_id: str, updated: Task):
    try:
        result = tasks_collection.update_one(
            {"_id": ObjectId(task_id)}, {"$set": updated.model_dump()}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        logger.info(f"Task {task_id} updated. Modified count: {result.modified_count}")
        return result.modified_count
    except PyMongoError as e:
        logger.exception(f"Error updating task {task_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating task")


def delete_task(task_id: str):
    try:
        result = tasks_collection.delete_one({"_id": ObjectId(task_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Task not found")
        logger.info(f"Task {task_id} deleted.")
        return result.deleted_count
    except PyMongoError as e:
        logger.exception(f"Error deleting task {task_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting task")
