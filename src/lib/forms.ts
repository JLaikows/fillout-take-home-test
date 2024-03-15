import axios from "axios";
import { Request, Response } from "express";
import {
  FilterClauseType,
  ResponseFiltersType,
  ResponseType,
  questionsType,
} from "../types";

const filloutApiKey = process.env.FILLOUT_API_KEY;

const filterQuestion = (filter: FilterClauseType, question: questionsType) => {
  if (!question) return false;
  switch (filter.condition) {
    case "greater_than":
      return question?.value > filter.value;
    case "less_than":
      return question?.value < filter.value;
    case "does_not_equal":
      return question?.value !== filter.value;
    default:
      return question?.value === filter.value;
  }
};

const filterDateQuestion = (
  filter: FilterClauseType,
  question: questionsType
) =>
  filterQuestion(
    { ...filter, value: new Date(filter.value) },
    { ...question, value: new Date(question.value) }
  );

const filterResponse =
  (filters: ResponseFiltersType) => (response: ResponseType) => {
    const { questions } = response;
    return filters.every((filter) => {
      const question = questions.find((q) => q.id === filter.id);
      if (!question) return false;

      return question.type === "DatePicker"
        ? filterDateQuestion(filter, question)
        : filterQuestion(filter, question);
    });
  };

const getUnfilteredResponses = async (
  id: string | number,
  query: Record<string, any>
) => {
  const queries: string = Object.entries(query)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const result = await axios.get(
    `https://api.fillout.com/v1/api/forms/${id}/submissions?${queries}`,
    {
      headers: {
        Authorization: `Bearer ${filloutApiKey}`,
      },
    }
  );

  return result.data;
};

const getFilteredResponses = async (
  id: string | number,
  query: Record<string, any>
) => {
  const { filters: rawFilters, limit, offset, ...rawQueries } = query;

  const parsedLimit = Number(limit) || 150;
  const parsedOffset = Number(offset) || 0;

  let queries: string = Object.entries(rawQueries)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const result = await axios.get(
    `https://api.fillout.com/v1/api/forms/${id}/submissions?${queries}`,
    {
      headers: {
        Authorization: `Bearer ${filloutApiKey}`,
      },
    }
  );

  const parsedFilters: string = rawFilters.replace(/^"(.*)"$/, "$1");
  const filters: ResponseFiltersType = JSON.parse(parsedFilters);
  const endPositon = parsedOffset + parsedLimit;
  const responses = result.data.responses
    .filter(filterResponse(filters))
    .slice(parsedOffset, endPositon);

  const totalResponses = responses.length;
  const pageCount = Math.ceil(responses.length / parsedLimit || 0);

  const data = {
    ...result.data,
    responses,
    pageCount,
    totalResponses,
  };

  return data;
};

export const getResponses = async (req: Request, res: Response) => {
  const { id } = req.params;

  let data: ResponseType;
  if (!req.query.filters) {
    data = await getUnfilteredResponses(id, req.query);
  } else {
    data = await getFilteredResponses(id, req.query);
  }

  res.json(data);
};
