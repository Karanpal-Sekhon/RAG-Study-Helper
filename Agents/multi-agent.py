from typing import Literal
from typing_extensions import TypedDict

from langchain_openai import ChatOpenAI
from langgraph.graph import MessagesState, StateGraph, Start, END
from langgraph.types import Command
from langchain_core.messages import HumanMessage


from decouple import config
import os

os.environ['OPENAI_API_KEY'] = config('OPENAI_API_KEY')




members = ['rag_qa_agent', 'flashcard_agent', 'exam_agent', 'resource_agent']
options = members + ['FINISH']


system_prompt = (
    "You are a supervisor of a team of workers in a chat app. You are managing the following agents: "
    f"agents: {members}. Given the following user request, respond with the appropriate agent to perform a task."
    "Each agent has a specific role. The 'rag_qa_agent' agent is responsible for answering questions about their noteset,"
    "the 'flashcard_agent' agent is responsible for creating flashcards from notes, the 'exam_agent' agent is responsible for creating exams from notes,"
    "and the 'resource_agent' agent is responsible for providing additional resources."
    "Each agent will perform a task and respond with their results and status. When finished, respond with FINISH."
)


class Router(TypedDict):

    next: Literal[*options] # type: ignore


llm = ChatOpenAI(model='gpt-3.5-turbo')


def delegation_node(state: MessagesState) -> Command[Literal[*members, "__end__"]]: # type: ignore
    messages = [
        {"role": "system", "content": system_prompt},
    ] + state['messages']

    response = llm.with_structured_output(Router).invoke(messages)
    goto = response['next']
    if goto == "FINISH":
        goto = END # type: ignore

    return Command(goto=goto)
        
    