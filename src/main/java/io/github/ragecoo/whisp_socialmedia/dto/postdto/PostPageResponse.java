package io.github.ragecoo.whisp_socialmedia.dto.postdto;

import lombok.Data;
import java.util.List;

@Data
public class PostPageResponse {
    private List<PostResponse> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrevious;
}

