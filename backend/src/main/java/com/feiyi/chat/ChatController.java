package com.feiyi.chat;

import com.feiyi.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final RagService ragService;

    public record AskRequest(@NotBlank(message = "问题不能为空") String question, Long exhibitId) {}
    public record SourceVO(Long exhibitId, String title) {}
    public record AskResponse(String answer, boolean needHuman, double confidence, List<SourceVO> sources, String engine) {}

    @PostMapping("/ask")
    public ApiResponse<AskResponse> ask(@Valid @RequestBody AskRequest request) {
        RagService.Answer answer = ragService.answer(request.question().trim(), request.exhibitId());
        List<SourceVO> sources = answer.sources().stream()
                .map(s -> new SourceVO(s.exhibitId(), s.title())).toList();
        return ApiResponse.ok(new AskResponse(answer.content(), answer.needHuman(), answer.confidence(), sources, answer.engine()));
    }
}